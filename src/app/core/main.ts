import { BrowserWindow, app } from 'electron';
import electronReload from 'electron-reload';
import * as fs from 'fs';
import * as path from 'path';

import sqlite3 = require('sqlite3');
import { CoreConfig } from './CoreConfig';
import { Updater } from './Updater';
import { WindowController } from './window/WindowController';

class Main {
  private isDevelopment: boolean;
  private database: sqlite3.Database;

  private config: CoreConfig;
  private windowController: WindowController;
  private updater: Updater;

  public constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    // TODO: Use Instance instead???
    this.config = new CoreConfig(this.isDevelopment);
  }

  public init() {
    // TODO: Update process for DB
    // Store db to userData on production.
    if (!this.isDevelopment) {
      // Define the source and destination paths for the database
      const sourcePath = path.join(__dirname, 'commander.db');
      const destinationPath = path.join(
        app.getPath('userData'),
        'commander.db'
      );
      // Check if the database file already exists in userData. iff not override!
      if (!fs.existsSync(destinationPath)) {
        // Copy the database file to userData
        fs.copyFileSync(sourcePath, destinationPath);
      }
    }

    if (require('electron-squirrel-startup')) {
      process.exit(0);
    }

    if (this.isDevelopment) {
      electronReload(path.join(__dirname, '../'), {});
    }

    // Set initial config params
    if (this.config.size() == 0) {
      this.config.set('version', app.getVersion());
      this.config.set('jumpRange', 30);
      this.config.set('excludedAffiliationIDs', []);
    }
    this.initHandlers();
    return this;
  }

  private initHandlers() {
    app.whenReady().then(() => {
      this.database = new sqlite3.Database(
        path
          .join(
            this.isDevelopment ? __dirname : app.getPath('userData'),
            'commander.db'
          )
          .replace('app.asar', 'app.asar.unpacked'),
        sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        (err) => {
          if (err) console.log(err);
          // TODO: Error Handling
        }
      );

      this.updater = new Updater(this.windowController);

      this.windowController = new WindowController(
        this.isDevelopment,
        this.database,
        this.config,
        this.updater
      );

      this.updater.checkForUpdates();

      if (this.isDevelopment) {
        this.windowController.openMainWindow();
      }
    });

    app.on('activate', () => {
      console.log('activate');
      if (BrowserWindow.getAllWindows().length === 0) {
        this.windowController.openMainWindow();
      }
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }
}

new Main().init();
