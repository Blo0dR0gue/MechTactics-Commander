import { Database } from 'sqlite';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';

class Upgrade011 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.1.1', 'Hotfix for upgrade bug');
  }
}

export { Upgrade011 };
