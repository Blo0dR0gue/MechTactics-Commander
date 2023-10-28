import { Database } from 'sqlite';
import { WindowBase } from '../WindowBase';
import * as path from 'path';
import { app, ipcMain } from 'electron';
import { PlanetJSON } from '../../../types/PlanetJson';
import { AffiliationJSON } from '../../../types/AffiliationJson';
import { CoreConfig } from '../../CoreConfig';

class MainWindow extends WindowBase {
  private database: Database;
  private config: CoreConfig;

  public constructor(
    isDevelopment: boolean,
    database: Database,
    config: CoreConfig
  ) {
    super(isDevelopment, 'index.html', path.join(__dirname, 'preload.js'));
    this.database = database;
    this.config = config;
  }

  protected setupHandler() {
    ipcMain.handle('getAllPlanets', () => {
      return new Promise<PlanetJSON[]>((resolve) => {
        this.database
          .all<PlanetJSON[]>(
            'SELECT rowid as rowID, name , x, y, affiliation as affiliationID, link FROM Planet'
          )
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllAffiliations', () => {
      return new Promise<AffiliationJSON[]>((resolve) => {
        this.database
          .all('SELECT rowid as rowID, name, color FROM affiliation')
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getConfigCache', () => {
      return this.config.getConfig();
    });

    ipcMain.handle('setConfigData', (event, key: string, value: unknown) => {
      return this.config.set(key, value);
    });

    ipcMain.handle('getAppData', () => {
      return {
        version: this.isDevelopment ? 'dev' : app.getVersion(),
      };
    });
  }
}

export { MainWindow };
