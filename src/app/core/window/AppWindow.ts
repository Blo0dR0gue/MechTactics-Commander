import { BrowserWindow, screen, ipcMain, app } from 'electron';
import * as path from 'path';
import { AppConstants } from '../AppConstants';
import { Database } from 'sqlite';
import { CoreConfig } from '../CoreConfig';
import {
  PlanetData,
  PlanetWithAffiliationAndAge,
} from '../../types/PlanetData';
import { AffiliationData } from '../../types/AffiliationData';
import { autoUpdater } from 'electron-updater';
import { PlanetAffiliationAgeData } from '../../types/PlanetAffiliationAge';
import {
  exportDatabaseToCSVs,
  exportTableToCSV,
  importDatabaseFromCSVs,
  importTableFromCSV,
  selectCSVDestination,
} from '../CSVHelper';
import { DatabaseTables } from '../../types/UtilityTypes';

// TODO: Use only one window and switch loaded files

class AppWindow {
  private window: BrowserWindow;

  public constructor(
    private isDevelopment: boolean,
    private database: Database,
    private config: CoreConfig
  ) {
    const size = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    this.window = new BrowserWindow({
      height: size.height,
      width: size.width,
      minHeight: 850,
      minWidth: 1700,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        devTools: this.isDevelopment ? true : false,
      },
    });

    if (this.isDevelopment) this.loadPage('index.html');
    else this.loadPage('update.html');

    if (this.isDevelopment) {
      // Open the DevTools.
      setTimeout(() => {
        this.window.webContents.openDevTools();
      }, 1000);
    } else {
      this.window.removeMenu();
    }

    this.setupHandler();
  }

  public getWindow(): BrowserWindow {
    return this.window;
  }

  public loadPage(pageName: 'update.html' | 'dashboard.html' | 'index.html') {
    this.window.loadFile(path.join(AppConstants.PAGES_DIR, pageName));
    this.window.maximize();
  }

  public close(): void {
    this.window.close();
    ipcMain.removeAllListeners();
  }

  public sendIpc(channel: string, ...message): void {
    console.log(`Sending ${message} to ${channel}`);
    this.window.webContents.send(channel, ...message);
  }

  private setupHandler() {
    ipcMain.handle('getPlanetsAtAge', (event, age: number) => {
      return new Promise<PlanetWithAffiliationAndAge[]>((resolve) => {
        this.database
          .all<PlanetWithAffiliationAndAge[]>(
            `SELECT id, name, x, y, link, planetText, u.affiliationID as affiliationID, u.universeAge as age FROM Planet as p JOIN PlanetAffiliationAge as u ON p.id = u.planetID WHERE u.universeAge = "${age}";`
          )
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllPlanets', () => {
      return new Promise<PlanetData[]>((resolve) => {
        this.database
          .all<PlanetData[]>(
            `SELECT id, name, x, y, link FROM Planet ORDER BY id ASC;`
          )
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllAffiliations', () => {
      return new Promise<AffiliationData[]>((resolve) => {
        this.database
          .all(`SELECT id, name, color FROM Affiliation;`)
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllPlanetAffiliationAges', () => {
      return new Promise<PlanetAffiliationAgeData[]>((resolve) => {
        this.database
          .all(
            `SELECT planetID, affiliationID, universeAge, planetText FROM PlanetAffiliationAge;`
          )
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllPlanetAffiliationAgesWithNames', () => {
      return new Promise<PlanetAffiliationAgeData[]>((resolve) => {
        this.database
          .all(
            `SELECT planetID, affiliationID, universeAge, planetText, p.name as planetName, a.name as affiliationName FROM PlanetAffiliationAge as u JOIN Planet as p ON p.id = u.planetID JOIN Affiliation as a ON a.id = u.affiliationID;`
          )
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllUniverseAges', () => {
      return new Promise<{ universeAge: number }[]>((resolve) => {
        this.database
          .all(`SELECT DISTINCT universeAge FROM PlanetAffiliationAge;`)
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle(
      'updatePlanet',
      (event, planet: PlanetData) =>
        new Promise<boolean>((resolve, reject) => {
          this.database
            .run(
              'UPDATE Planet SET name = ?, link = ?, x = ?, y = ? WHERE id = ?;',
              planet.name,
              planet.link,
              planet.x,
              planet.y,
              planet.id
            )
            .then(() => resolve(true))
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'createPlanet',
      (event, planet: PlanetData) =>
        new Promise<PlanetData>((resolve, reject) => {
          this.database
            .run(
              'INSERT INTO Planet (name, link, x, y) VALUES (?, ?, ?, ?)',
              planet.name,
              planet.link,
              planet.x,
              planet.y
            )
            .then((runResult) => {
              resolve({
                ...planet,
                id: runResult.lastID,
              });
            })
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'deletePlanet',
      (event, planet: PlanetData) =>
        new Promise<boolean>((resolve, reject) => {
          this.database
            .run(
              'DELETE FROM PlanetAffiliationAge WHERE planetID = ?;',
              planet.id
            )
            .then(() => {
              this.database
                .run('DELETE FROM Planet WHERE id = ?;', planet.id)
                .then(() => resolve(true))
                .catch((reason) => reject(reason));
            })
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'updateAffiliation',
      (event, affiliation: AffiliationData) =>
        new Promise<boolean>((resolve, reject) => {
          this.database
            .run(
              'UPDATE Affiliation SET name = ?, color = ? WHERE id = ?;',
              affiliation.name,
              affiliation.color
            )
            .then(() => resolve(true))
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'createAffiliation',
      (event, affiliation: AffiliationData) =>
        new Promise<AffiliationData>((resolve, reject) => {
          this.database
            .run(
              'INSERT INTO Affiliation (name, color) VALUES (?, ?)',
              affiliation.name,
              affiliation.color
            )
            .then((runResult) =>
              resolve({ ...affiliation, id: runResult.lastID })
            )
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'deleteAffiliation',
      (event, affiliation: AffiliationData) =>
        new Promise<boolean>((resolve, reject) => {
          if (affiliation.id === 0)
            reject("You can't delete the affiliation with id 0");
          this.database
            .run(
              'UPDATE PlanetAffiliationAge SET affiliationID = 0 WHERE affiliationID = ?;',
              affiliation.id
            )
            .then(() => {
              this.database
                .run('DELETE FROM Affiliation WHERE id = ?;', affiliation.id)
                .then(() => resolve(true))
                .catch((reason) => reject(reason));
            })
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'updatePlanetAffiliationAge',
      (event, data: PlanetAffiliationAgeData) =>
        new Promise<boolean>((resolve, reject) => {
          this.database
            .run(
              'UPDATE PlanetAffiliationAge SET affiliationID = ?, planetText = ? WHERE planetID = ? AND universeAge = ?;',
              data.affiliationID,
              data.planetText,
              data.planetID,
              data.universeAge
            )
            .then(() => {
              resolve(true);
            })
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'createPlanetAffiliationAge',
      (event, data: PlanetAffiliationAgeData) =>
        new Promise<PlanetAffiliationAgeData>((resolve, reject) => {
          this.database
            .run(
              'INSERT INTO PlanetAffiliationAge (universeAge, planetID, affiliationID, planetText) VALUES (?, ?, ?, ?);',
              data.universeAge,
              data.planetID,
              data.affiliationID,
              data.planetText
            )
            .then(() => {
              resolve(data);
            })
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'createPlanetAffiliationAges',
      (event, dataPoints: PlanetAffiliationAgeData[]) =>
        new Promise<PlanetAffiliationAgeData[]>((resolve, reject) => {
          const insertPromises = dataPoints.map((point) => {
            return this.database
              .run(
                'INSERT INTO PlanetAffiliationAge (universeAge, planetID, affiliationID) VALUES (?, ?, ?);',
                point.universeAge,
                point.planetID,
                point.affiliationID
              )
              .then(() => {
                return point;
              });
          });

          Promise.all(insertPromises)
            .then((results) => resolve(results))
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'deletePlanetAffiliationAge',
      (event, data: PlanetAffiliationAgeData) =>
        new Promise<boolean>((resolve, reject) => {
          this.database
            .run(
              'DELETE FROM PlanetAffiliationAge WHERE planetID = ? AND universeAge = ? AND affiliationID = ?;',
              data.planetID,
              data.universeAge,
              data.affiliationID
            )
            .then(() => {
              resolve(true);
            })
            .catch((reason) => reject(reason));
        })
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

    ipcMain.handle('restartAndUpdate', () => {
      autoUpdater.quitAndInstall();
    });

    ipcMain.handle(
      'exportTableToCSV',
      async (event, tableName: DatabaseTables) => {
        const filePath = await selectCSVDestination(this, true, false);
        if (!filePath)
          return new Promise<void>((resolve) => {
            resolve();
          });
        return exportTableToCSV(this.database, tableName, filePath);
      }
    );

    ipcMain.handle(
      'importTableFromCSV',
      async (event, tableName: DatabaseTables) => {
        const filePath = await selectCSVDestination(this, false, false);
        if (!filePath)
          return new Promise<void>((resolve) => {
            resolve();
          });
        return importTableFromCSV(this.database, tableName, filePath);
      }
    );

    ipcMain.handle('exportDatabaseToCSVs', () => {
      return exportDatabaseToCSVs(this, this.database);
    });

    ipcMain.handle('importDatabaseFromCSVs', () => {
      return importDatabaseFromCSVs(this, this.database);
    });
  }
}

export { AppWindow };
