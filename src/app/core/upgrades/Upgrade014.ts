import { Database } from 'sqlite';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';

class Upgrade014 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.1.4', 'Import/Export of database tables');
  }
}

export { Upgrade014 };
