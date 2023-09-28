import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import electronReload from 'electron-reload';
import ChildProcess = require('child_process');

import sqlite3 = require('sqlite3');
import { PlanetAffiliationJSON } from './core/types/PlanetAffiliation';

const development = process.env.NODE_ENV === 'development';

if (require('electron-squirrel-startup')) {
  process.exit(0);
}

if (development) {
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

  if (development) {
    // Open the DevTools.
    setTimeout(() => {
      mainWindow.webContents.openDevTools();
    }, 1000);
  }
}

app.whenReady().then(() => {
  const userDataPath = app.getPath('userData');

  // TODO: Update process for DB
  // Store db to userData on production.
  if (!development) {
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
      .join(development ? __dirname : userDataPath, 'BattleTechCommander.db')
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  process.exit(0);
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, err;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {
      err = error;
      console.log(err);
    }

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}
