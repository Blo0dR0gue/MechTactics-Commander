import { Database } from 'sqlite';
import { AffiliationData } from '../../types/AffiliationData';
import { PlanetData, PlanetTag, PlanetTags } from '../../types/PlanetData';
import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { CoreConfig } from '../CoreConfig';
import {
  AffiliationRepository,
  PlanetAffiliationAgeRepository,
  PlanetRepository,
  PlanetTagRepository
} from '../repositories';
import data015 from './data/data015.json';

class Upgrade015 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.1.5', 'Adding New Planet Data');

    // Add new planet columns
    this.actions.push(async () => {
      await this.database.exec(
        "ALTER TABLE Planet ADD detail TEXT NOT NULL DEFAULT '';"
      );
      await this.database.exec(
        'ALTER TABLE Planet ADD fuelingStation BOOLEAN NOT NULL DEFAULT 0;'
      );
      await this.database.exec(
        "ALTER TABLE Planet ADD type CHARACTER(1) NOT NULL DEFAULT 'X';"
      );
      await this.database.exec(
        "ALTER TABLE Planet ADD civilization text NOT NULL DEFAULT 'None';"
      );
      await this.database.exec(
        "ALTER TABLE Planet ADD population text NOT NULL DEFAULT 'None';"
      );
      await this.database.exec(
        "ALTER TABLE Planet ADD size text NOT NULL DEFAULT 'Unknown';"
      );
    });

    // New planet tag table
    this.actions.push(async () => {
      await this.database.exec(`
            CREATE TABLE IF NOT EXISTS PlanetTag (
                planetID INTEGER NOT NULL,
                tagKey TEXT NOT NULL,
                tagValue TEXT NOT NULL,
                FOREIGN KEY (planetID) REFERENCES Planet(id) ON DELETE CASCADE,
                PRIMARY KEY(planetID, tagKey, tagValue)
            );
        `);
    });

    // Add Delete Cascade to PlanetAffiliationAge
    this.actions.push(async () => {
      await this.database.exec(`
          PRAGMA foreign_keys=OFF;

          BEGIN TRANSACTION;

          CREATE TABLE PlanetAffiliationAge_NEW
          (
            universeAge INTEGER NOT NULL,
            planetID INTEGER NOT NULL,
            affiliationID INTEGER NOT NULL DEFAULT 0,
            planetText TEXT DEFAULT '',
            PRIMARY KEY (planetID, universeAge),
            FOREIGN KEY (planetID) REFERENCES Planet(id) ON DELETE CASCADE,
            FOREIGN KEY (affiliationID) REFERENCES Affiliation(id) ON DELETE SET DEFAULT
          );

          INSERT INTO PlanetAffiliationAge_NEW(universeAge, planetID, affiliationID, planetText) SELECT universeAge, planetID, affiliationID, COALESCE( planetText , '' ) as planetText FROM PlanetAffiliationAge;

          DROP TABLE PlanetAffiliationAge;
          ALTER TABLE PlanetAffiliationAge_NEW RENAME TO PlanetAffiliationAge;

          COMMIT;

          PRAGMA foreign_keys=ON;
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
                  PlanetTag
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

    // Insert new data
    this.actions.push(async () => {
      try {
        this.database.run('BEGIN TRANSACTION;');

        const planetRepository = new PlanetRepository(this.database);
        const planetAffiliationAgeRepository =
          new PlanetAffiliationAgeRepository(this.database);
        const affiliationRepository = new AffiliationRepository(this.database);
        const planetTagRepository = new PlanetTagRepository(this.database);

        const importData: {
          name: string;
          detail: string;
          type: string;
          affiliation: string;
          fuelingStation: boolean;
          tagObject: PlanetTags;
          civilization: string;
          population: string;
          size: string;
          x: number;
          y: number;
        }[] = data015;

        for (const val of importData) {
          const { tagObject, affiliation, ...planetData } = val;

          let currentPlanet: Omit<PlanetData, 'tagObject'> =
            await planetRepository.getByName(planetData.name);

          if (currentPlanet === null) {
            currentPlanet =
              (await this.database.get<Omit<PlanetData, 'tagObject'>>(
                'SELECT * FROM Planet WHERE name LIKE ? AND round(x,2) = round(?,2) AND (round(y,2) = round(?,2) OR round(-y,2) = round(?,2)) AND type = ?',
                [
                  planetData.name + '%',
                  planetData.x,
                  planetData.y,
                  planetData.y,
                  'X'
                ]
              )) ?? null;
          }

          const currentAffiliation: AffiliationData =
            await affiliationRepository.getByName(affiliation);

          let planetID: number;
          let affiliationID: number;

          if (currentPlanet) {
            // Update planet
            planetID = currentPlanet.id;
            await planetRepository.updateByKey(
              { id: currentPlanet.id },
              { ...planetData, link: currentPlanet.link }
            );
          } else {
            // Insert planet
            planetID = await planetRepository.create({
              ...planetData,
              link: 'http://www.sarna.net/'
            });
          }

          // Insert new planet tags
          const resultTagObject: Omit<PlanetTag, 'id'>[] = [];
          for (const [tagKey, tagValues] of Object.entries(tagObject)) {
            for (const value of tagValues) {
              resultTagObject.push({
                tagKey,
                tagValue: value,
                planetID: planetID
              });
            }
          }

          await planetTagRepository.createMany(resultTagObject);

          if (currentAffiliation) {
            affiliationID = currentAffiliation.id;
            // Insert new affiliation
          } else {
            affiliationID = await affiliationRepository.create({
              name: val.affiliation,
              color: '#FFFFFF'
            });
          }

          // Insert the new planet affiliation age data
          await planetAffiliationAgeRepository.create({
            affiliationID: affiliationID,
            planetID: planetID,
            planetText: '',
            universeAge: 3062
          });
        }

        //await Promise.all(waitingPromises);

        const notUpdatedPlanets: Omit<PlanetData, 'tagObject'>[] =
          await this.database.all('SELECT * FROM Planet WHERE type = ?;', 'X');
        const revertNegationOfYPromises = notUpdatedPlanets.map(
          (notUpdatedPlanet) => {
            return this.database.run('UPDATE Planet SET y = ? WHERE id = ?', [
              -notUpdatedPlanet.y,
              notUpdatedPlanet.id
            ]);
          }
        );
        await Promise.all(revertNegationOfYPromises);

        this.database.run('COMMIT;');
      } catch (error: unknown) {
        this.database.run('ROLLBACK;');
        throw new Error('Adding new data failed');
      }
    });
  }

  private floatsEqual(num1, num2): boolean {
    const tolerance = 1e-10;
    return Math.abs(num1 - num2) < tolerance;
  }
}

export { Upgrade015 };
