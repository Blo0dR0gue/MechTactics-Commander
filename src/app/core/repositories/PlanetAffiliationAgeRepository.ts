import { Database } from 'sqlite';
import {
  PlanetAffiliationAgeData,
  PlanetAffiliationAgeWithNamesData
} from '../../types/PlanetAffiliationAge';
import { BaseRepository } from './BaseRepository';

export class PlanetAffiliationAgeRepository extends BaseRepository<
  PlanetAffiliationAgeData,
  { universeAge: number; planetID: number; affiliationID: number },
  object
> {
  public constructor(database: Database) {
    super(database, 'PlanetAffiliationAge');
  }

  public getAllWithNames(): Promise<PlanetAffiliationAgeWithNamesData[]> {
    return this.database.all(
      'SELECT u.*, p.name as planetName, a.name as affiliationName FROM PlanetAffiliationAge as u JOIN Planet as p ON p.id = u.planetID JOIN Affiliation as a ON a.id = u.affiliationID;'
    );
  }

  public getAllUniverseAges(): Promise<Set<number>> {
    return this.database
      .all(`SELECT DISTINCT universeAge FROM PlanetAffiliationAge;`)
      .then((data) => {
        return data.reduce((acc, val) => {
          acc.add(val.universeAge);
          return acc;
        }, new Set<number>());
      });
  }

  public async deleteAllByPlanet(planetID: number): Promise<void> {
    await this.database.run(
      'DELETE FROM PlanetAffiliationAge WHERE planetID = ?;',
      [planetID]
    );
  }

  public async updateAllOfAffiliationToDefault(
    affiliationID: number
  ): Promise<void> {
    await this.database.run(
      'UPDATE PlanetAffiliationAge SET affiliationID = 0 WHERE affiliationID = ?;',
      [affiliationID]
    );
  }

  public async deleteAllByUniverseAge(universeAge: number): Promise<void> {
    await this.database.run(
      'DELETE FROM PlanetAffiliationAge WHERE universeAge = ?;',
      [universeAge]
    );
  }
}
