import { BrowserWindow, screen, ipcMain, app } from 'electron';
import * as path from 'path';
import { AppConstants } from '../AppConstants';
import { Database } from 'sqlite';
import { CoreConfig } from '../CoreConfig';
import { PlanetResponse } from '../../types/PlanetResponse';
import { AffiliationResponse } from '../../types/AffiliationResponse';
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
