import { Database } from 'sqlite';

import {
  PlanetData,
  PlanetTag,
  PlanetWithAffiliationAndAge,
} from '../../types/PlanetData';
import { BaseRepository } from './BaseRepository';
import { PlanetTagRepository } from './PlanetTagRepository';
import { PlanetAffiliationAgeRepository } from './PlanetAffiliationAgeRepository';
import { ForcefullyOmit } from '../../types/UtilityTypes';

export class PlanetRepository extends BaseRepository<
  Omit<PlanetData, 'tagList'>
> {
  private planetTagRepository: PlanetTagRepository;
  private planetAffiliationAgeRepository: PlanetAffiliationAgeRepository;

  public constructor(database: Database) {
    super(database, 'Planet');
    this.planetTagRepository = new PlanetTagRepository(this.database);
    this.planetAffiliationAgeRepository = new PlanetAffiliationAgeRepository(
      this.database
    );
  }

  public async getAllInUniverseAge(
    age: number
  ): Promise<PlanetWithAffiliationAndAge[]> {
    return this.database.all(
      'SELECT id, name, x, y, link, planetText, u.affiliationID as affiliationID, u.universeAge as age FROM Planet as p JOIN PlanetAffiliationAge as u ON p.id = u.planetID WHERE u.universeAge = ?;',
      [age]
    );
  }

  public async delete(id: number): Promise<boolean> {
    return this.runTransaction<boolean>(async (): Promise<boolean> => {
      await super.delete(id);
      await this.planetTagRepository.deleteAllByPlanet(id);
      await this.planetAffiliationAgeRepository.deleteAllByPlanet(id);

      return true;
    });
  }

  public create(data: ForcefullyOmit<PlanetData, 'id'>): Promise<PlanetData> {
    return this.runTransaction<PlanetData>(async (): Promise<PlanetData> => {
      const { tagList: planetTagList, ...planetData } = data;
      const planetResult = await super.create(planetData);

      const tagList: Omit<PlanetTag, 'id'>[] = [];
      for (const [tagKey, tagValues] of Object.entries(planetTagList)) {
        for (const value of tagValues) {
          tagList.push({ tagKey, tagValue: value, planetID: planetResult.id });
        }
      }

      await this.planetTagRepository.createMany(tagList);

      return { ...planetResult, tagList: planetTagList };
    });
  }

  public async update(
    id: number,
    data: ForcefullyOmit<PlanetData, 'id'>
  ): Promise<boolean> {
    return this.runTransaction<boolean>(async (): Promise<boolean> => {
      const { tagList: planetTagList, ...planetData } = data;
      await super.update(id, planetData);

      // Delete old tags
      await this.planetTagRepository.deleteAllByPlanet(id);

      // Insert new tags
      const tagList: Omit<PlanetTag, 'id'>[] = [];
      for (const [tagKey, tagValues] of Object.entries(planetTagList)) {
        for (const value of tagValues) {
          tagList.push({ tagKey, tagValue: value, planetID: id });
        }
      }
      await this.planetTagRepository.createMany(tagList);

      return true;
    });
  }
}
