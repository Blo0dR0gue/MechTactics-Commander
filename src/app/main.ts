import {
  app,
  BrowserWindow,
  screen,
  ipcMain,
  dialog,
  MessageBoxOptions,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as fs from 'fs';
import electronReload from 'electron-reload';

import sqlite3 = require('sqlite3');
import { PlanetAffiliationJSON } from './core/types/PlanetAffiliation';

const isDevelopment = process.env.NODE_ENV === 'development';

if (require('electron-squirrel-startup')) {
  process.exit(0);
}

if (isDevelopment) {
  electronReload(__dirname, {});
}

function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: size.height,
    width: size.width,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, './index.html'));
  mainWindow.maximize();

  if (isDevelopment) {
    // Open the DevTools.
    setTimeout(() => {
      mainWindow.webContents.openDevTools();
    }, 1000);
  }
  mainWindow.once('ready-to-show', () => {
    if (!isDevelopment) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
}

app.whenReady().then(() => {
  const userDataPath = app.getPath('userData');

  // TODO: Update process for DB
  // Store db to userData on production.
  if (!isDevelopment) {
    // Define the source and destination paths for the database
    const sourcePath = path.join(__dirname, 'BattleTechCommander.db');
    const destinationPath = path.join(userDataPath, 'BattleTechCommander.db');
    // Check if the database file already exists in userData. iff not override!
    if (!fs.existsSync(destinationPath)) {
      // Copy the database file to userData
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }

  createWindow();
  const db = new sqlite3.Database(
    path
      .join(isDevelopment ? __dirname : userDataPath, 'BattleTechCommander.db')
      .replace('app.asar', 'app.asar.unpacked'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      console.log(err);
    }
  );

  ipcMain.handle('getAllPlanets', () => {
    return new Promise<PlanetAffiliationJSON[]>(function (resolve, reject) {
      db.all(
        'SELECT p.name as planetName, x, y, affiliation as affiliationId, link, a.name as nameAffiliation, color FROM Planet as p JOIN Affiliation as a ON p.affiliation = a.rowid',
        (err, rows: PlanetAffiliationJSON[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

autoUpdater.on('update-available', () => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Ok'],
    title: 'Application Update',
    message: 'A new version is being downloaded',
    details: 'A new version is being downloaded',
  } as MessageBoxOptions;
  dialog.showMessageBox(dialogOpts);
});

autoUpdater.on('update-downloaded', () => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: 'A new version is being downloaded',
    details:
      'A new version has been downloaded. Restart the application to apply the updates.',
  } as MessageBoxOptions;
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
