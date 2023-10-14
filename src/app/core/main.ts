import { BrowserWindow, MessageBoxOptions, app, dialog } from 'electron';
import electronReload from 'electron-reload';
import { autoUpdater } from 'electron-updater';
import * as fs from 'fs';
import * as path from 'path';

import sqlite3 = require('sqlite3');
import { MainWindow } from './window/main/MainWindow';
import { UpdateWindow } from './window/update/UpdateWindow';
import { CoreConfig } from './CoreConfig';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// TODO: To separate class
let db: sqlite3.Database;

if (require('electron-squirrel-startup')) {
  process.exit(0);
}

if (IS_DEVELOPMENT) {
  electronReload(path.join(__dirname, '../'), {});
}

// Use Instance instead???
const CONFIG = new CoreConfig(IS_DEVELOPMENT);

if (CONFIG.size() == 0) {
  CONFIG.set('version', app.getVersion());
}

// TODO: Handling
const updateRequired = true;

function createUpdateWindow() {
  return new UpdateWindow(IS_DEVELOPMENT);
}

function createMainWindow() {
  return new MainWindow(IS_DEVELOPMENT, db, CONFIG);
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

  db = new sqlite3.Database(
    path
      .join(IS_DEVELOPMENT ? __dirname : userDataPath, 'commander.db')
      .replace('app.asar', 'app.asar.unpacked'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      console.log(err);
      // TODO: Error Handling
    }
  );

  autoUpdater.checkForUpdatesAndNotify();

  console.log('test2');
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

autoUpdater.on('update-not-available', () => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Ok'],
    title: 'Application Update',
    message: 'Downloading a new version',
    detail: 'Downloading a new version',
  } as MessageBoxOptions;
  dialog.showMessageBox(dialogOpts);
  console.log('test');
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
