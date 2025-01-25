import { Database } from 'sqlite';

import {
  PlanetData,
  PlanetTag,
  PlanetTags,
  PlanetWithAffiliationAndAge
} from '../../types/PlanetData';
import { BaseRepository } from './BaseRepository';
import { ForcefullyOmit } from '../../types/UtilityTypes';
import { PlanetTagRepository } from '.';

export class PlanetRepository extends BaseRepository<
  Omit<PlanetData, 'tagObject'>,
  { id: number },
  { id: number }
> {
  private planetTagRepository: PlanetTagRepository;

  public constructor(database: Database) {
    super(database, 'Planet');
    this.planetTagRepository = new PlanetTagRepository(this.database);
  }

  public async getAll(): Promise<PlanetData[]> {
    const stmt = await this.database.prepare(
      'SELECT * FROM PlanetWithTagsView;'
    );

    try {
      const planet = await stmt.all<(PlanetData & { tagObject: string })[]>();

      return planet.map((planet) => {
        const parsedTagObject: unknown = JSON.parse(planet.tagObject);
        Object.keys(parsedTagObject).forEach((key) => {
          parsedTagObject[key] = JSON.parse(parsedTagObject[key]);
        });

        return {
          ...planet,
          tagObject: parsedTagObject as PlanetTags
        };
      });
    } finally {
      stmt.finalize();
    }
  }

  public async getByKey({ id }: { id: number }): Promise<PlanetData> {
    const stmt = await this.database.prepare(
      'SELECT * FROM PlanetWithTagsView WHERE id = ?;'
    );

    try {
      const planet = await stmt.get<PlanetData & { tagObject: string }>(id);

      const parsedTagObject: unknown = JSON.parse(planet.tagObject);
      Object.keys(parsedTagObject).forEach((key) => {
        parsedTagObject[key] = JSON.parse(parsedTagObject[key]);
      });

      return {
        ...planet,
        tagObject: parsedTagObject as PlanetTags
      };
    } finally {
      stmt.finalize();
    }
  }

  public async getAllInUniverseAge(
    age: number
  ): Promise<PlanetWithAffiliationAndAge[]> {
    const stmt = await this.database.prepare(
      'SELECT pwtv.*, paa.affiliationID as affiliationID, paa.universeAge as age, paa.planetText as planetText FROM PlanetWithTagsView as pwtv JOIN PlanetAffiliationAge as paa ON pwtv.id = paa.planetID WHERE universeAge = ?;'
    );

    try {
      const result = await stmt.all<
        (PlanetWithAffiliationAndAge & { tagObject: string })[]
      >(age);

      return result.map((planet) => {
        const parsedTagObject: unknown = JSON.parse(planet.tagObject);
        Object.keys(parsedTagObject).forEach((key) => {
          parsedTagObject[key] = JSON.parse(parsedTagObject[key]);
        });

        return {
          ...planet,
          tagObject: parsedTagObject as PlanetTags
        };
      });
    } finally {
      stmt.finalize();
    }
  }

  public create(data: ForcefullyOmit<PlanetData, 'id'>): Promise<number> {
    return this.runTransaction<number>(async (): Promise<number> => {
      const { tagObject: planetTagObject, ...planetData } = data;
      const planetResult = await super.create(planetData);

      const resultTagObject: Omit<PlanetTag, 'id'>[] = [];
      for (const [tagKey, tagValues] of Object.entries(planetTagObject)) {
        for (const value of tagValues) {
          resultTagObject.push({
            tagKey,
            tagValue: value,
            planetID: planetResult
          });
        }
      }

      await this.planetTagRepository.createMany(resultTagObject);

      return planetResult;
    });
  }

  public async update(
    id: number,
    data: ForcefullyOmit<PlanetData, 'id'>
  ): Promise<boolean> {
    return this.runTransaction<boolean>(async (): Promise<boolean> => {
      const { tagObject: planetTagObject, ...planetData } = data;
      await super.updateByKey({ id: id }, planetData);

      // Delete old tags
      await this.planetTagRepository.deleteAllByPlanet(id);

      // Insert new tags
      const resultTagObject: Omit<PlanetTag, 'id'>[] = [];
      for (const [tagKey, tagValues] of Object.entries(planetTagObject)) {
        for (const value of tagValues) {
          resultTagObject.push({ tagKey, tagValue: value, planetID: id });
        }
      }
      await this.planetTagRepository.createMany(resultTagObject);

      return true;
    });
  }
}
