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
  }
}

export { Upgrade009 };
