import { Database } from 'sqlite';
import PlanetAffiliationAgeDynFormatter from '../../../renderer/utils/components/formatter/PlanetAffiliationAgeDynFormatter';
import {
  DynamicPlanetAffiliationConnectData,
  PlanetAffiliationAgeWithNamesData
} from '../../../types/PlanetAffiliationAge';
import { PlanetAffiliationAgeRepository } from '../../repositories';
import { CSVStrategy, CSVExportData, CSVColumn } from './CSVStrategy';
import { DatabaseTables } from '../../../types/UtilityTypes';

export class CSVPlanetAffiliationAgeStrategy extends CSVStrategy<DynamicPlanetAffiliationConnectData> {
  private planetAffiliationAgeRepository: PlanetAffiliationAgeRepository;

  public constructor(database: Database, tableName: DatabaseTables) {
    super(database, tableName);
    this.planetAffiliationAgeRepository = new PlanetAffiliationAgeRepository(
      this.database
    );
  }

  public async importEntry(
    data: DynamicPlanetAffiliationConnectData
  ): Promise<void> {
    const affiliationIDKeys = Object.keys(data).filter((key) =>
      key.includes('affiliationID')
    );

    if (affiliationIDKeys.length === 0) {
      throw Error('No affiliation data found');
    }

    const ages = affiliationIDKeys.reduce((acc, key) => {
      if (data[key]) {
        acc.push(key.replace('affiliationID', ''));
      }
      return acc;
    }, []);

    const ageInserts: Promise<unknown>[] = [];

    ages
      .map((age) => parseInt(age))
      .forEach((age) => {
        const insertPromise = new Promise<unknown>((resolve, reject) => {
          if (typeof age !== 'number' || age < 0) {
            reject(`Found age not valid: '${age}'!`);
            return;
          }

          const planetID: number = parseInt(data['planetID'] + '');

          if (typeof planetID !== 'number' || planetID < 0) {
            reject(`Found planet id is not valid: '${planetID}'!`);
            return;
          }

          const affiliationID: number = parseInt(data[`affiliationID${age}`]);

          if (typeof affiliationID !== 'number' || affiliationID < 0) {
            reject(`Found affiliation id is not valid: '${affiliationID}'!`);
            return;
          }

          const planetText: string = data[`planetText${age}`] ?? '';

          if (typeof planetText !== 'string') {
            reject(`Found planet text is not valid: '${planetText}'!`);
            return;
          }

          this.planetAffiliationAgeRepository
            .createOrUpdate(
              { planetID, universeAge: age },
              { affiliationID, planetText }
            )
            .then(resolve, reject);
        });

        ageInserts.push(insertPromise);
      });

    return Promise.all(ageInserts).then(() => {});
  }

  public async getExportData(): Promise<
    CSVExportData<DynamicPlanetAffiliationConnectData>
  > {
    const rows = await this.planetAffiliationAgeRepository.getAll();
    const ages = await this.planetAffiliationAgeRepository.getAllUniverseAges();

    const formatter = new PlanetAffiliationAgeDynFormatter();

    // We do not need the planet/affiliation so it is ok to parse the data.
    const formattedRows = formatter.format(
      rows as PlanetAffiliationAgeWithNamesData[]
    );

    const columnKeys: CSVColumn[] = [];
    columnKeys.push({
      header: 'planetID',
      key: 'planetID'
    });

    ages.forEach((age) => {
      // Add headers fo the affiliation-id and the planet-text for the different universe ages we have
      columnKeys.push({
        header: `affiliationID${age}`,
        key: `affiliationData.age${age}.affiliationID`
      });
      columnKeys.push({
        header: `planetText${age}`,
        key: `affiliationData.age${age}.planetText`
      });
    });

    return { columnKeys: columnKeys, rows: formattedRows };
  }
}
