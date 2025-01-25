import { Database } from 'sqlite';
import { PlanetData, PlanetTag, PlanetTagKey } from '../../types/PlanetData';
import {
  PlanetAffiliationAgeRepository,
  PlanetRepository,
  PlanetTagRepository
} from '../repositories';
import {
  DynamicPlanetAffiliationConnectData,
  PlanetAffiliationAgeData,
  PlanetAffiliationAgeWithNamesData
} from '../../types/PlanetAffiliationAge';
import PlanetAffiliationAgeDynFormatter from '../../renderer/utils/components/formatter/PlanetAffiliationAgeDynFormatter';
import { DatabaseTables } from '../../types/UtilityTypes';

export interface CSVImportStrategy<DataType> {
  importEntry(database: Database, data: DataType): Promise<void>;
}

export type CSVColumn = { key: string; header: string };

export type CSVExportData<DataType> = {
  columnKeys: CSVColumn[];
  rows: DataType[];
};

export interface CSVExportStrategy<DataType> {
  getExportData(database: Database): Promise<CSVExportData<DataType>>;
}

export type PlanetTagSpread = {
  [key: PlanetTagKey]: string;
};
export type PlanetWithSpreadTags = Omit<PlanetData, 'tagObject'> &
  PlanetTagSpread;

export class CSVDefaultStrategy
  implements CSVExportStrategy<unknown>, CSVImportStrategy<unknown>
{
  private tableName: DatabaseTables;

  public constructor(tableName: DatabaseTables) {
    this.tableName = tableName;
  }

  public async importEntry(database: Database, data: unknown): Promise<void> {
    const databaseKeys = Object.keys(data).join(', ');
    const values = Object.values(data)
      .map((value) => `"${value}"`)
      .join(', ');
    const query = `INSERT OR REPLACE INTO ${this.tableName} (${databaseKeys}) VALUES (${values})`;
    await database.run(query);
  }

  public async getExportData(
    database: Database
  ): Promise<CSVExportData<unknown>> {
    const rows = await database.all(`SELECT * FROM ${this.tableName};`);

    const columnKeys = Object.keys(rows[0]).map((key) => {
      return {
        key: key,
        header: key
      } as CSVColumn;
    });

    return { columnKeys: columnKeys, rows: rows };
  }
}

export class CSVPlanetTagsStrategy
  implements
    CSVExportStrategy<PlanetWithSpreadTags>,
    CSVImportStrategy<PlanetWithSpreadTags>
{
  private splitWithEscape(input: string) {
    return (
      input.match(/(?:\\.|[^,])+/g)?.map((s) => s.replace(/\\(.)/g, '$1')) || []
    );
  }

  public async importEntry(
    database: Database,
    data: PlanetWithSpreadTags
  ): Promise<void> {
    const planetRepository = new PlanetRepository(database);
    const planetTagRepository = new PlanetTagRepository(database);

    const { id, name, x, y, link, detail, fuelingStation, type, ...tags } =
      data;

    await planetRepository.createOrReplace({
      id,
      name,
      x,
      y,
      link,
      detail,
      fuelingStation,
      type
    });

    await planetTagRepository.deleteAllByPlanet(id);

    Object.keys(tags).forEach((tagKey) => {
      this.splitWithEscape(tags[tagKey])
        .map((value) => value.trim())
        .forEach(async (tagValue) => {
          const planetTag: PlanetTag = {
            planetID: id,
            tagKey: tagKey,
            tagValue: tagValue
          };

          await planetTagRepository.createOrReplace(planetTag);
        });
    });
  }

  public async getExportData(
    database: Database
  ): Promise<CSVExportData<PlanetWithSpreadTags>> {
    const planetRepository = new PlanetRepository(database);

    const planetData = await planetRepository.getAllWithTags();

    const planetsWithSpreadTags = planetData.map((planet) => {
      const { tagObject, ...planetData } = planet;

      const tagValuesSpread = {} as PlanetTagSpread;
      Object.keys(tagObject).forEach((key) => {
        tagValuesSpread[key] = tagObject[key].join(', ');
      });

      return { ...planetData, ...tagValuesSpread } as PlanetWithSpreadTags;
    });

    Object.keys(planetsWithSpreadTags[0]).forEach((key) =>
      columnKeys.push({
        key: key,
        header: key
      })
    );

    const columnKeys = [];

    return {
      columnKeys: columnKeys,
      rows: planetsWithSpreadTags
    };
  }
}

export class CSVPlanetAffiliationAgeStrategy
  implements
    CSVImportStrategy<DynamicPlanetAffiliationConnectData>,
    CSVExportStrategy<DynamicPlanetAffiliationConnectData>
{
  public async importEntry(
    database: Database,
    data: DynamicPlanetAffiliationConnectData
  ): Promise<void> {
    const planetAffiliationAgeRepository = new PlanetAffiliationAgeRepository(
      database
    );

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

    ages.forEach((age) => {
      const insertPromise = new Promise<unknown>((resolve, reject) => {
        if (typeof age !== 'number' || age < 0) {
          reject(`Found age not valid: '${age}'!`);
          return;
        }

        const planetID: number = data['planetID'];

        if (typeof planetID !== 'number' || planetID < 0) {
          reject(`Found planet id is not valid: '${planetID}'!`);
          return;
        }

        const affiliationID: number = data[`affiliationID${age}`];

        if (typeof affiliationID !== 'number' || affiliationID < 0) {
          reject(`Found affiliation id is not valid: '${affiliationID}'!`);
          return;
        }

        const planetText: string = data[`planetText${age}`] ?? '';

        if (typeof planetText !== 'string') {
          reject(`Found planet text is not valid: '${planetText}'!`);
          return;
        }

        const elem = {
          universeAge: age,
          planetID: planetID,
          affiliationID: affiliationID,
          planetText: planetText
        } as PlanetAffiliationAgeData;

        planetAffiliationAgeRepository
          .createOrReplace(elem)
          .then(resolve, reject);
      });

      ageInserts.push(insertPromise);
    });

    return Promise.all(ageInserts).then(() => {});
  }

  public async getExportData(
    database: Database
  ): Promise<CSVExportData<DynamicPlanetAffiliationConnectData>> {
    const planetAffiliationAgeRepository = new PlanetAffiliationAgeRepository(
      database
    );

    const rows = await planetAffiliationAgeRepository.getAll();
    const ages = await planetAffiliationAgeRepository.getAllUniverseAges();

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
