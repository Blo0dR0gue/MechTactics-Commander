import { Database } from 'sqlite';

import { PlanetTag } from '../../types/PlanetData';
import { BaseRepository } from './BaseRepository';
import { ForcefullyOmit } from '../../types/UtilityTypes';

export class PlanetTagRepository extends BaseRepository<PlanetTag> {
  public constructor(database: Database) {
    super(database, 'PlanetTag');
  }

  public async deleteAllByPlanet(planetID: number) {
    return this.database.run(`DELETE FROM PlanetTag WHERE planetID = ?;`, [
      planetID,
    ]);
  }

  public async createMany(
    tagList: ForcefullyOmit<PlanetTag, 'id'>[]
  ): Promise<PlanetTag[]> {
    const results: PlanetTag[] = [];

    const insertTag = await this.database.prepare(
      `INSERT INTO PlanetTag (planetID, tagKey, tagValue) VALUES (?, ?, ?);`
    );
    for (const tag of tagList) {
      const result = await insertTag.run(
        tag.planetID,
        tag.tagKey,
        tag.tagValue
      );
      results.push({ ...tag, id: result.lastID });
    }

    await insertTag.finalize();

    return results;
  }
}
