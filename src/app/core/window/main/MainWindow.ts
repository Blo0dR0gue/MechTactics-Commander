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
    ipcMain.handle('getAllPlanets', (event, age: string) => {
      return new Promise<PlanetJSON[]>((resolve) => {
        this.database
          .all<PlanetJSON[]>(
            `SELECT id, name, x, y, link, planetText, u.affiliationID as affiliationID FROM Planet as p JOIN PlanetAffiliationAge as u ON p.id = u.planetID WHERE u.universeAge = "${age}";`
          )
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllAffiliations', (event, age: string) => {
      return new Promise<AffiliationJSON[]>((resolve) => {
        this.database
          .all(
            `SELECT DISTINCT id, name, color FROM Affiliation as a JOIN PlanetAffiliationAge as u ON a.id = u.affiliationID WHERE u.universeAge = "${age}";`
          )
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle(
      'updatePlanetText',
      (event, id: number, universeAge: string, text: string) => {
        this.database.run(
          `UPDATE PlanetAffiliationAge SET planetText = ? WHERE universeAge = ? AND planetID = ?;`,
          text,
          universeAge,
          id
        );
      }
    );

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
