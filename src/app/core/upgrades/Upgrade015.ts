import { Database } from 'sqlite';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';

class Upgrade015 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.1.5', 'New Planet Data');
    this.actions.push(async () => {
      this.database.run(`
          CREATE VIEW PlanetWithTagsView AS
          WITH TagGroups AS (
              SELECT
                  planet_id,
                  tag_key,
                  json_group_array(tag_value) AS tag_values
              FROM
                  PlanetTags
              GROUP BY
                  planet_id, tag_key
          ),
          PlanetWithTags AS (
              SELECT
                  p.id,
                  p.name,
                  p.x,
                  p.y,
                  p.fueling_station,
                  p.type,
                  CASE
                      WHEN COUNT(tg.planet_id) = 0 THEN '{}'
                      ELSE json_group_object(tag_key, tag_values)
                  END AS tags
              FROM
                  Planet p
                  LEFT JOIN TagGroups tg ON p.id = tg.planet_id
              GROUP BY
                  p.id
          )
          SELECT
              id,
              name,
              x,
              y,
              type,
              fueling_station,
              tags
          FROM
              PlanetWithTags;
        `);
    });
  }
}

export { Upgrade015 };
