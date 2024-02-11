import { Database } from 'sqlite';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';

class Upgrade014 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.1.4', 'TODO');
    this.actions.push(async () => {
      // TODO:
    });
  }
}

export { Upgrade014 };
