import sqlite3 = require('sqlite3');
import { CoreConfig } from './CoreConfig';

abstract class AppUpgradeInfo {
  public version: string;
  public description: string;
  public actions: (() => Promise<void>)[];
  protected config: CoreConfig;
  protected database: sqlite3.Database;

  public constructor(
    config: CoreConfig,
    database: sqlite3.Database,
    version: string,
    description: string
  ) {
    this.config = config;
    this.database = database;
    this.actions = [];
    this.version = version;
    this.description = description;
  }
}

export { AppUpgradeInfo };
