import { Database } from 'sqlite';

import { BaseRepository } from './BaseRepository';
import { AffiliationData } from '../../types/AffiliationData';

export class AffiliationRepository extends BaseRepository<
  AffiliationData,
  { id: number },
  { id: number }
> {
  public constructor(database: Database) {
    super(database, 'Affiliation');
  }

  public async getByName(name: string): Promise<AffiliationData> {
    const stmt = await this.database.prepare(
      'SELECT * FROM Affiliation WHERE name = ? ORDER BY id ASC;'
    );

    try {
      const affiliation = await stmt.get<AffiliationData>(name);
      return affiliation ?? null;
    } finally {
      stmt.finalize();
    }
  }
}
