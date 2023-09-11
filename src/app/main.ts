import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import electronReload from 'electron-reload';
import ChildProcess = require('child_process');

import sqlite3 = require('sqlite3');
import { PlanetAffiliation } from './core/types/PlanetAffiliation';

if (require('electron-squirrel-startup')) {
  process.exit(0);
}

if (process.env.NODE_ENV == 'development') {
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

  if (process.env.NODE_ENV == 'development') {
    // Open the DevTools.
    setTimeout(() => {
      mainWindow.webContents.openDevTools();
    }, 1000);
  }
}

app.whenReady().then(() => {
  createWindow();

  const db = new sqlite3.Database(
    path.join(__dirname, 'BattleTechCommander.db'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      console.log(err);
    }
  );

  ipcMain.handle(
    'getAllPlanets',
    () =>
      new Promise<PlanetAffiliation[]>(function (resolve, reject) {
        db.all(
          'SELECT p.name as planetName, x, y, affiliation as affiliationId, link, a.name as nameAffiliation, color FROM Planet as p JOIN Affiliation as a ON p.affiliation = a.rowid',
          (err, rows: PlanetAffiliation[]) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          }
        );
      })
  );

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
