import { Database } from 'sqlite';
import { DatabaseTables } from '../../../types/UtilityTypes';
import { AffiliationRepository } from '../../repositories';
import { CSVColumn, CSVExportData, CSVStrategy } from './CSVStrategy';
import { AffiliationData } from '../../../types/AffiliationData';

export class CSVAffiliationStrategy extends CSVStrategy<AffiliationData> {
  private affiliationRepository: AffiliationRepository;

  public constructor(database: Database, tableName: DatabaseTables) {
    super(database, tableName);
    this.affiliationRepository = new AffiliationRepository(database);
  }

  public async importEntry(data: AffiliationData): Promise<void> {
    await this.affiliationRepository.createOrUpdate(
      { id: data.id },
      { color: data.color, name: data.name }
    );
  }
  public async getExportData(): Promise<CSVExportData<AffiliationData>> {
    const rows = await this.affiliationRepository.getAll();

    const columnKeys = Object.keys(rows[0]).map((key) => {
      return {
        key: key,
        header: key
      } as CSVColumn;
    });

    return { columnKeys: columnKeys, rows: rows };
  }
}
