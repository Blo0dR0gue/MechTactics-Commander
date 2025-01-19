import { Database } from 'sqlite';

import { BaseRepository } from './BaseRepository';
import { PlanetAffiliationAgeRepository } from './PlanetAffiliationAgeRepository';
import { AffiliationData } from '../../types/AffiliationData';

export class AffiliationRepository extends BaseRepository<AffiliationData> {
  private planetAffiliationAgeRepository: PlanetAffiliationAgeRepository;

  public constructor(database: Database) {
    super(database, 'Affiliation');
    this.planetAffiliationAgeRepository = new PlanetAffiliationAgeRepository(
      this.database
    );
  }

  public async delete(id: number): Promise<boolean> {
    if (id === 0) {
      throw new Error("You can't delete the affiliation with id 0");
    }

    return this.runTransaction<boolean>(async (): Promise<boolean> => {
      await this.planetAffiliationAgeRepository.updateAllOfAffiliationToDefault(
        id
      );
      await super.delete(id);

      return true;
    });
  }
}
