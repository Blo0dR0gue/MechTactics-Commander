import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { Database } from 'sqlite';
import { CoreConfig } from '../CoreConfig';

class Upgrade008 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(
      config,
      database,
      '0.0.8',
      'Added core features, route settings and planet search'
    );
    this.actions.push(async () => {
      this.config.set('version', '0.0.8');
      this.config.set('jumpRange', 30);
      this.config.set('excludedAffiliationIDs', []);
    });
  }
}

export { Upgrade008 };
