import { BrowserWindow, app } from 'electron';
import electronReload from 'electron-reload';
import * as fs from 'fs';
import * as path from 'path';

import sqlite3 = require('sqlite3');
import { MainWindow } from './window/main/MainWindow';
import { UpdateWindow } from './window/update/UpdateWindow';
import { CoreConfig } from './CoreConfig';
import { Updater } from './Updater';
import { WindowBase } from './window/WindowBase';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
let currentWindow: WindowBase;

// TODO: To separate class
let db: sqlite3.Database;

// TODO: Update process for DB
// Store db to userData on production.
if (!IS_DEVELOPMENT) {
  // Define the source and destination paths for the database
  const sourcePath = path.join(__dirname, 'commander.db');
  const destinationPath = path.join(app.getPath('userData'), 'commander.db');
  // Check if the database file already exists in userData. iff not override!
  if (!fs.existsSync(destinationPath)) {
    // Copy the database file to userData
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

if (require('electron-squirrel-startup')) {
  process.exit(0);
}

if (IS_DEVELOPMENT) {
  electronReload(path.join(__dirname, '../'), {});
}

// Use Instance instead???
const CONFIG = new CoreConfig(IS_DEVELOPMENT);

// Set initial config params
if (CONFIG.size() == 0) {
  CONFIG.set('version', app.getVersion());
  CONFIG.set('jumpRange', 30);
  CONFIG.set('excludedAffiliationIDs', []);
}

function setWindow(newWindow: WindowBase) {
  if (currentWindow) {
    currentWindow.close();
    currentWindow = newWindow;
    currentWindow.open();
  } else {
    currentWindow = newWindow;
    currentWindow.open();
  }
}

function openMainWindow() {
  const window = new MainWindow(IS_DEVELOPMENT, db, CONFIG);
  setWindow(window);
}

function openUpdaterWindow() {
  const window = new UpdateWindow(IS_DEVELOPMENT);
  setWindow(window);
}

app.whenReady().then(() => {
  db = new sqlite3.Database(
    path
      .join(
        IS_DEVELOPMENT ? __dirname : app.getPath('userData'),
        'commander.db'
      )
      .replace('app.asar', 'app.asar.unpacked'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) console.log(err);
      // TODO: Error Handling
    }
  );

  const UPDATER = new Updater(openMainWindow, openUpdaterWindow);
  UPDATER.checkForUpdates();

  if (IS_DEVELOPMENT) {
    const window = new MainWindow(IS_DEVELOPMENT, db, CONFIG);
    setWindow(window);
  }
});

app.on('activate', function () {
  console.log('activate');
  if (BrowserWindow.getAllWindows().length === 0) {
    const window = new MainWindow(IS_DEVELOPMENT, db, CONFIG);
    setWindow(window);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
