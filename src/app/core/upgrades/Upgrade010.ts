import { Database } from 'sqlite';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';

class Upgrade010 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.0.10', '');
    this.actions.push(async () => {
      config.set('selectedUniverseAge', 3025);
    });
  }
}

export { Upgrade010 };
