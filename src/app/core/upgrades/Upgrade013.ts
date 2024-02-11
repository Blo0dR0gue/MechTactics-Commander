import { Database } from 'sqlite';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';

class Upgrade013 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.1.3', 'Added background settings');
    this.actions.push(async () => {
      this.config.set('backgroundColor', '#08001f');
    });
  }
}

export { Upgrade013 };
