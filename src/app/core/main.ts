import { BrowserWindow, app } from 'electron';
import electronReload from 'electron-reload';
import * as fs from 'fs';
import * as path from 'path';

import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

import { CoreConfig } from './CoreConfig';
import { Updater } from './Updater';
import { AppWindow } from './window/AppWindow';

import { insertCSVIntoDatabase } from './CSVHelper';
import { AppConstants } from './AppConstants';

class Main {
  private isDevelopment: boolean;
  private database: Database;

  private config: CoreConfig;
  private updater: Updater;
  private appWindow: AppWindow;

  public constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    // TODO: Use Instance instead???
    this.config = new CoreConfig(this.isDevelopment);

    insertCSVIntoDatabase(AppConstants.ROOT_DIR + '../' + 'test.csv', '');
  }

  public init() {
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
      this.config.set('selectedUniverseAge', 3025);
      this.config.set('backgroundColor', '#08001f');
    }
    this.initHandlers();
    return this;
  }

  private initHandlers() {
    app.whenReady().then(async () => {
      sqlite3.verbose();
      this.database = await open({
        driver: sqlite3.Database,
        filename: path
          .join(
            this.isDevelopment ? __dirname : app.getPath('userData'),
            'commander.db'
          )
          .replace('app.asar', 'app.asar.unpacked'),
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      });

      // Enable FK Checks
      this.database.get('PRAGMA foreign_keys = ON');
      // Enable error tracing
      this.database.on('trace', (data) => {
        // TODO: Error handling database
        console.log(data);
      });

      this.appWindow = new AppWindow(
        this.isDevelopment,
        this.database,
        this.config
      );

      this.updater = new Updater(this.database, this.config, this.appWindow);
      this.updater.checkForUpdates();
    });

    app.on('activate', () => {
      console.log('activate');
      if (BrowserWindow.getAllWindows().length === 0) {
        this.appWindow.loadPage('index.html');
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
