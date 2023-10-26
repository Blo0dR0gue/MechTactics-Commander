import { AppUpgradeInfo } from '../AppUpgradeInfo';
import sqlite3 = require('sqlite3');
import { CoreConfig } from '../CoreConfig';

class Upgrade009 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: sqlite3.Database) {
    super(config, database, '0.0.9', 'Test');
    this.actions.push(async () => {
      console.log('Upgrading config');
      this.config.set('version', '0.0.9');
    });
    this.actions.push(async () => {
      console.log('Upgrading Database');
      // TODO: Enable foreign_keys globally -> db.get("PRAGMA foreign_keys = ON")
      database.serialize(() => {});
      /*
      FIX DATABASE LIKE THIS:
      PRAGMA foreign_keys = 1;
      CREATE TABLE IF NOT EXISTS Parent(id INTEGER PRIMARY KEY AUTOINCREMENT, name text);
      CREATE TABLE IF NOT EXISTS Child(id INTEGER PRIMARY KEY AUTOINCREMENT, name text, parent_id INTEGER, FOREIGN KEY (parent_id) REFERENCES Parent (id));
      INSERT INTO Child (name, parent_id) VALUES('test',1);
      INSERT INTO Child (name, parent_id) VALUES('test',77);
      */
    });
  }
}

export { Upgrade009 };
