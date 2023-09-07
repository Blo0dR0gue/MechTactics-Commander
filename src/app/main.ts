import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import electronReload from 'electron-reload';
import Database from 'better-sqlite3';

let db: Database.Database;

if (process.env.NODE_ENV == 'development') {
  electronReload(__dirname, {});
}

function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: size.height,
    width: size.width,
    webPreferences: {},
  });

  mainWindow.loadFile(path.join(__dirname, './index.html'));
  mainWindow.maximize();

  if (process.env.NODE_ENV == 'development') {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  db = new Database(`${__dirname}/core/BattleTechCommander.db`, {
    verbose: console.log,
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  db.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
