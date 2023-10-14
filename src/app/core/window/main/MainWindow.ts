import sqlite3 = require('sqlite3');
import { WindowBase } from '../WindowBase';
import * as path from 'path';
import { app, ipcMain } from 'electron';
import { PlanetJSON } from '../../../types/PlanetJson';
import { AffiliationJSON } from '../../../types/AffiliationJson';
import { CoreConfig } from '../../CoreConfig';

class MainWindow extends WindowBase {
  private db: sqlite3.Database;
  private config: CoreConfig;

  public constructor(
    isDevelopment: boolean,
    database: sqlite3.Database,
    config: CoreConfig
  ) {
    super(isDevelopment, 'index.html', path.join(__dirname, 'preload.js'));
    this.db = database;
    this.config = config;
  }

  protected setupHandler() {
    ipcMain.handle('getAllPlanets', () => {
      return new Promise<PlanetJSON[]>(function (resolve, reject) {
        this.db.all(
          'SELECT rowid as rowID, name , x, y, affiliation as affiliationID, link FROM Planet',
          (err, rows: PlanetJSON[]) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          }
        );
      });
    });

    ipcMain.handle('getAllAffiliations', () => {
      return new Promise<AffiliationJSON[]>(function (resolve, reject) {
        this.db.all(
          'SELECT rowid as rowID, name, color FROM affiliation',
          (err, rows: AffiliationJSON[]) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          }
        );
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
