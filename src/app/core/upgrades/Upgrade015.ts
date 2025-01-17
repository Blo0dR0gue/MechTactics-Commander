import { Database } from 'sqlite';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';

class Upgrade015 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.1.5', 'New Planet Data');

    // Add new planet columns
    this.actions.push(async () => {
      await this.database.exec('ALTER TABLE Planet ADD detail TEXT;');
      await this.database.exec(
        'ALTER TABLE Planet ADD fuelingStation BOOLEAN;'
      );
      await this.database.exec('ALTER TABLE Planet ADD type CHARACTER(1);');
    });

    // New planet tag table
    this.actions.push(async () => {
      await this.database.exec(`
            CREATE TABLE IF NOT EXISTS PlanetTags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                planetID INTEGER NOT NULL,
                tagKey TEXT NOT NULL,
                tagValue TEXT NOT NULL,
                FOREIGN KEY (planetID) REFERENCES Planet(id) ON DELETE CASCADE
            );
        `);
    });

    // Create View
    this.actions.push(async () => {
      await this.database.exec(`
        CREATE VIEW PlanetWithTagsView AS
          WITH TagGroups AS (
              SELECT
                  planetID,
                  tagKey,
                  json_group_array(tagValue) AS tagList
              FROM
                  PlanetTags
              GROUP BY
                  planetID, tagKey
          ),
          PlanetWithTags AS (
              SELECT
                  p.*,
                  CASE
                      WHEN COUNT(tg.planetID) = 0 THEN '{}'
                      ELSE json_group_object(tagKey, tagList)
                  END AS tagObject
              FROM
                  Planet p
                  LEFT JOIN TagGroups tg ON p.id = tg.planetID
              GROUP BY
                  p.id
          )
          SELECT * FROM PlanetWithTags;
        `);
    });
  }
}

export { Upgrade015 };
