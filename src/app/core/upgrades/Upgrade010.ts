import { Database } from 'sqlite';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';

class Upgrade010 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.0.10', 'Added a dashboard');
    this.actions.push(async () => {
      config.set('selectedUniverseAge', 3025);
    });
    this.actions.push(async () => {
      database.run(
        "INSERT INTO Affiliation (id, name, color) VALUES (0, 'Default', '#FFFFFF');"
      );
    });
  }
}

export { Upgrade010 };
