import { AppUpgradeInfo } from '../AppUpgradeInfo';
import sqlite3 = require('sqlite3');
import { CoreConfig } from '../CoreConfig';

class Upgrade009 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: sqlite3.Database) {
    super(config, database, '0.0.9', 'Test');
    this.actions.push(async () => {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 10000);
      });
    });
    this.actions.push(async () => {
      await new Promise<void>((resolve) => {
        console.log('test');
        setTimeout(() => {
          resolve();
        }, 5000);
      });
    });
  }
}

export { Upgrade009 };
