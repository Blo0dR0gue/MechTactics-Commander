import { Database } from 'sqlite';
import { BaseRepository } from './BaseRepository';
import { PlanetTag } from '../../types/PlanetData';
import { ForcefullyOmit } from '../../types/UtilityTypes';
import { stringToSnakeCase } from '../../renderer/utils/Utils';

export class PlanetTagRepository extends BaseRepository<
  PlanetTag,
  { planetID: number; tagKey: string },
  undefined
> {
  public constructor(database: Database) {
    super(database, 'PlanetTag');
  }

  public async deleteAllByPlanet(planetID: number) {
    return this.database.run(`DELETE FROM PlanetTag WHERE planetID = ?;`, [
      planetID
    ]);
  }

  public create(data: ForcefullyOmit<PlanetTag, never>): Promise<number> {
    const createData = this.convertToDatabaseFormat(data);

    return super.create(createData);
  }

  public createOrReplace(data: PlanetTag): Promise<number | null> {
    const createData = this.convertToDatabaseFormat(data);
    return super.createOrReplace(createData);
  }

  public updateByKey(): Promise<boolean> {
    throw new Error(`Can't update a PlanetTag!`);
  }

  public async createMany(tagList: PlanetTag[]): Promise<PlanetTag[]> {
    const results: PlanetTag[] = [];

    const insertTag = await this.database.prepare(
      `INSERT INTO PlanetTag (planetID, tagKey, tagValue) VALUES (?, ?, ?);`
    );
    for (const tag of tagList) {
      await insertTag.run(tag.planetID, tag.tagKey, tag.tagValue);
      results.push({ ...tag });
    }

    await insertTag.finalize();

    return results;
  }

  private convertToDatabaseFormat(data: PlanetTag) {
    const { tagKey, ...rest } = data;

    const snakeCaseTagKey = stringToSnakeCase(tagKey);

    return { tagKey: snakeCaseTagKey, ...rest };
  }
}
