import {
  BrowserWindow,
  MessageBoxOptions,
  app,
  dialog,
  ipcMain,
} from 'electron';
import electronReload from 'electron-reload';
import { autoUpdater } from 'electron-updater';
import * as fs from 'fs';
import * as path from 'path';

import sqlite3 = require('sqlite3');
import ElectronStore = require('electron-store');
import { PlanetJSON } from '../types/PlanetJson';
import { AffiliationJSON } from '../types/AffiliationJson';
import { MainWindow } from './window/main/MainWindow';
import { UpdateWindow } from './window/update/UpdateWindow';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

if (require('electron-squirrel-startup')) {
  process.exit(0);
}

if (IS_DEVELOPMENT) {
  electronReload(path.join(__dirname, '../'), {});
}

// TODO: Separate config class
const store = new ElectronStore({
  cwd: IS_DEVELOPMENT
    ? path.join(__dirname, '../', '../')
    : app.getPath('userData'),
});

if (store.size == 0) {
  store.set('version', app.getVersion());
}

// TODO: Handling
const updateRequired = false;

function createUpdateWindow() {
  return new UpdateWindow(IS_DEVELOPMENT);
}

function createMainWindow() {
  return new MainWindow(IS_DEVELOPMENT);
}

app.whenReady().then(() => {
  const userDataPath = app.getPath('userData');

  // TODO: Update process for DB
  // Store db to userData on production.
  if (!IS_DEVELOPMENT) {
    // Define the source and destination paths for the database
    const sourcePath = path.join(__dirname, 'commander.db');
    const destinationPath = path.join(userDataPath, 'commander.db');
    // Check if the database file already exists in userData. iff not override!
    if (!fs.existsSync(destinationPath)) {
      // Copy the database file to userData
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }

  const db = new sqlite3.Database(
    path
      .join(IS_DEVELOPMENT ? __dirname : userDataPath, 'commander.db')
      .replace('app.asar', 'app.asar.unpacked'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      console.log(err);
      // TODO: Error Handling
    }
  );

  ipcMain.handle('getAllPlanets', () => {
    return new Promise<PlanetJSON[]>(function (resolve, reject) {
      db.all(
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
      db.all(
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
    return store.store;
  });

  ipcMain.handle('setConfigData', (event, key: string, value: unknown) => {
    return store.set(key, value);
  });

  ipcMain.handle('getAppData', () => {
    return {
      version: IS_DEVELOPMENT ? 'dev' : app.getVersion(),
    };
  });

  if (updateRequired) {
    const updateWindow = createUpdateWindow();
    setTimeout(() => {
      createMainWindow();
      updateWindow.close();
    }, 10000);
  } else {
    createMainWindow();
  }
});

autoUpdater.on('update-available', () => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Ok'],
    title: 'Application Update',
    message: 'Downloading a new version',
    detail: 'Downloading a new version',
  } as MessageBoxOptions;
  dialog.showMessageBox(dialogOpts);
});

autoUpdater.on('update-downloaded', () => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: 'A new version has been downloaded',
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.',
  } as MessageBoxOptions;
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (updateRequired) {
      createUpdateWindow();
    } else {
      createMainWindow();
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
