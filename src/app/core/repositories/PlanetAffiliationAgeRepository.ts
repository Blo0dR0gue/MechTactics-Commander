import { Database } from 'sqlite';
import {
  PlanetAffiliationAgeData,
  PlanetAffiliationAgeWithNamesData,
} from '../../types/PlanetAffiliationAge';

export class PlanetAffiliationAgeRepository {
  protected database: Database;

  public constructor(database: Database) {
    this.database = database;
  }

  public getAll(): Promise<PlanetAffiliationAgeData[]> {
    return this.database.all(
      'SELECT planetID, affiliationID, universeAge, planetText FROM PlanetAffiliationAge;'
    );
  }

  public getAllWithNames(): Promise<PlanetAffiliationAgeWithNamesData[]> {
    return this.database.all(
      'SELECT planetID, affiliationID, universeAge, planetText, p.name as planetName, a.name as affiliationName FROM PlanetAffiliationAge as u JOIN Planet as p ON p.id = u.planetID JOIN Affiliation as a ON a.id = u.affiliationID;'
    );
  }

  public getAllUniverseAges(): Promise<{ universeAge: number }[]> {
    return this.database
      .all(`SELECT DISTINCT universeAge FROM PlanetAffiliationAge;`)
      .then((data) => {
        return data.reduce((acc, val) => {
          acc.add(val.universeAge);
          return acc;
        }, new Set<number>());
      });
  }

  public async create(data: PlanetAffiliationAgeData): Promise<void> {
    await this.database.run(
      'INSERT INTO PlanetAffiliationAge (universeAge, planetID, affiliationID, planetText) VALUES (?, ?, ?, ?);',
      data.universeAge,
      data.planetID,
      data.affiliationID,
      data.planetText
    );
    return undefined;
  }

  public async delete(data: Omit<PlanetAffiliationAgeData, 'planetText'>) {
    return this.database.run(
      'DELETE FROM PlanetAffiliationAge WHERE planetID = ? AND universeAge = ? AND affiliationID = ?;',
      data.planetID,
      data.universeAge,
      data.affiliationID
    );
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

  public async update(data: PlanetAffiliationAgeData): Promise<void> {
    await this.database.run(
      'UPDATE PlanetAffiliationAge SET affiliationID = ?, planetText = ? WHERE planetID = ? AND universeAge = ?;',
      data.affiliationID,
      data.planetText,
      data.planetID,
      data.universeAge
    );
  }
}
