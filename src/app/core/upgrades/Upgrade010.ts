import { Database } from 'sqlite';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';

class Upgrade010 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(
      config,
      database,
      '0.1.0',
      'Added a dashboard to edit the data of the database'
    );
    this.actions.push(async () => {
      config.set('selectedUniverseAge', 3025);
    });
    this.actions.push(async () => {
      database.run(
        "INSERT INTO Affiliation (id, name, color) VALUES (0, 'Default', '#FFFFFF');"
      );
    });
    this.actions.push(async () => {
      console.log('Upgrading config');
      this.config.set('version', '0.1.0');
    });
  }
}

export { Upgrade010 };
