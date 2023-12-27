import { BrowserWindow, screen, ipcMain, app } from 'electron';
import * as path from 'path';
import { AppConstants } from '../AppConstants';
import { Database } from 'sqlite';
import { CoreConfig } from '../CoreConfig';
import { PlanetRequest, PlanetResponse } from '../../types/PlanetData';
import {
  AffiliationRequest,
  AffiliationResponse,
} from '../../types/AffiliationData';
import { autoUpdater } from 'electron-updater';

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
    ipcMain.handle('getPlanetsAtAge', (event, age: string) => {
      return new Promise<PlanetResponse[]>((resolve) => {
        this.database
          .all<PlanetResponse[]>(
            `SELECT id, name, x, y, link, planetText, u.affiliationID as affiliationID FROM Planet as p JOIN PlanetAffiliationAge as u ON p.id = u.planetID WHERE u.universeAge = "${age}";`
          )
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllPlanets', () => {
      return new Promise<PlanetResponse[]>((resolve) => {
        this.database
          .all<PlanetResponse[]>(
            `SELECT id, name, x, y, link, planetText, u.affiliationID as affiliationID, u.universeAge as age FROM Planet as p JOIN PlanetAffiliationAge as u ON p.id = u.planetID;`
          )
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllAffiliations', () => {
      return new Promise<AffiliationResponse[]>((resolve) => {
        this.database
          .all(`SELECT id, name, color FROM Affiliation;`)
          .then((data) => {
            resolve(data);
          });
      });
    });

    ipcMain.handle('getAllUniverseAges', () => {
      return new Promise<AffiliationResponse[]>((resolve) => {
        this.database
          .all(`SELECT DISTINCT universeAge FROM PlanetAffiliationAge;`)
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

    ipcMain.handle('updatePlanet', (event, planet: PlanetRequest) => {
      this.database
        .run(
          'UPDATE Planet SET name = ?, link = ?, x = ?, y = ? WHERE id = ?;',
          planet.name,
          planet.link,
          planet.coordinates.x,
          planet.coordinates.y,
          planet.id
        )
        .then(() => {
          this.database.run(
            'UPDATE PlanetAffiliationAge SET planetText = ? WHERE universeAge = ? AND planetID = ? AND affiliationID = ?;',
            planet.planetText,
            planet.age,
            planet.id,
            planet.affiliationID
          );
        });
    });

    ipcMain.handle('createPlanet', (event, planet: PlanetRequest) => {
      this.database
        .run(
          'INSERT INTO Planet (name, link, x, y) VALUES (?, ?, ?, ?)',
          planet.name,
          planet.link,
          planet.coordinates.x,
          planet.coordinates.y
        )
        .then((runResult) => {
          this.database.run(
            'INSERT INTO PlanetAffiliationAge (planetID, affiliationID, universeAge) VALUES (?, ?, ?)',
            runResult.lastID,
            planet.affiliationID,
            planet.age
          );
        });
    });

    ipcMain.handle('deletePlanet', (event, planet: PlanetRequest) => {
      this.database
        .run(
          'DELETE FROM PlanetAffiliationAge WHERE planetID = ? AND affiliationID = ? AND universeAge = ?;',
          planet.id,
          planet.affiliationID,
          planet.age
        )
        .then(() => {
          this.database.run('DELETE FROM Planet WHERE id = ?;', planet.id);
        });
    });

    ipcMain.handle(
      'updateAffiliation',
      (event, affiliation: AffiliationRequest) => {
        this.database.run(
          'UPDATE Affiliation SET name = ?, color = ? WHERE id = ?;',
          affiliation.name,
          affiliation.color
        );
      }
    );

    ipcMain.handle(
      'createAffiliation',
      (event, affiliation: AffiliationRequest) => {
        this.database.run(
          'INSERT INTO Affiliation (name, color) VALUES (?, ?)',
          affiliation.name,
          affiliation.color
        );
      }
    );

    ipcMain.handle(
      'deleteAffiliation',
      (event, affiliation: AffiliationRequest) => {
        if (affiliation.id === 0) return;
        this.database
          .run(
            'UPDATE PlanetAffiliationAge SET affiliationID = 0 WHERE affiliationID = ?;',
            affiliation.id
          )
          .then(() => {
            this.database.run(
              'DELETE FROM Affiliation WHERE id = ?;',
              affiliation.id
            );
          });
      }
    );

    ipcMain.handle('addPlanetToAge', (event, planet: PlanetRequest) => {
      this.database.run(
        'INSERT INTO PlanetAffiliationAge (universeAge, planetID, affiliationID) VALUES (?, ?, ?);',
        planet.age,
        planet.id,
        planet.affiliationID
      );
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

    ipcMain.handle('restartAndUpdate', () => {
      autoUpdater.quitAndInstall();
    });
  }
}

export { AppWindow };
