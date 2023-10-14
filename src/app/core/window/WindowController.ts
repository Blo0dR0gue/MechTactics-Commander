import sqlite3 = require('sqlite3');
import { WindowBase } from './WindowBase';
import { MainWindow } from './main/MainWindow';
import { CoreConfig } from '../CoreConfig';
import { UpdateWindow } from './update/UpdateWindow';
import { Updater } from '../Updater';

class WindowController {
  public currentWindow: WindowBase;

  private isDevelopment: boolean;
  private database: sqlite3.Database;
  private config: CoreConfig;
  private updater: Updater;

  public constructor(
    isDevelopment: boolean,
    database: sqlite3.Database,
    config: CoreConfig,
    updater: Updater
  ) {
    this.isDevelopment = isDevelopment;
    this.database = database;
    this.config = config;
    this.updater = updater;
  }

  public openMainWindow() {
    this.setWindow(
      new MainWindow(this.isDevelopment, this.database, this.config)
    );
  }

  public openUpdateWindow() {
    this.setWindow(new UpdateWindow(this.isDevelopment, this.updater));
  }

  private setWindow(newWindow: WindowBase) {
    if (this.currentWindow) {
      this.currentWindow.close();
      this.currentWindow = newWindow;
    } else {
      this.currentWindow = newWindow;
    }
  }
}

export { WindowController };
