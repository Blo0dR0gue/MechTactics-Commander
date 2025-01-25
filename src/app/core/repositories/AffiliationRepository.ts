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
}
