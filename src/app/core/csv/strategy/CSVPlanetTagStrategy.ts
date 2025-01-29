import { Database } from 'sqlite';
import { PlanetTagKey, PlanetData, PlanetTag } from '../../../types/PlanetData';
import { PlanetRepository, PlanetTagRepository } from '../../repositories';
import { CSVStrategy, CSVExportData, CSVColumn } from './CSVStrategy';
import { DatabaseTables } from '../../../types/UtilityTypes';

export type PlanetTagSpread = {
  [key: PlanetTagKey]: string;
};
export type PlanetWithSpreadTags = Omit<PlanetData, 'tagObject'> &
  PlanetTagSpread;

export class CSVPlanetTagsStrategy extends CSVStrategy<PlanetWithSpreadTags> {
  private planetRepository: PlanetRepository;
  private planetTagRepository: PlanetTagRepository;

  public constructor(database: Database, tableName: DatabaseTables) {
    super(database, tableName);
    this.planetRepository = new PlanetRepository(database);
    this.planetTagRepository = new PlanetTagRepository(database);
  }

  private splitWithEscape(input: string) {
    return (
      input.match(/(?:\\.|[^,])+/g)?.map((s) => s.replace(/\\(.)/g, '$1')) || []
    );
  }

  public async importEntry(data: PlanetWithSpreadTags): Promise<void> {
    const {
      id,
      name,
      x,
      y,
      link,
      detail,
      fuelingStation,
      type,
      civilization,
      population,
      size,
      jumpDistance,
      ...tags
    } = data;

    await this.planetRepository.createOrUpdate(
      { id },
      {
        name,
        x,
        y,
        link,
        detail,
        fuelingStation,
        type,
        civilization,
        population,
        size,
        jumpDistance
      }
    );

    await this.planetTagRepository.deleteAllByPlanet(id);

    Object.keys(tags).forEach((tagKey) => {
      this.splitWithEscape(tags[tagKey])
        .map((value) => value.trim())
        .filter((value) => value !== '')
        .forEach(async (tagValue) => {
          const planetTag: PlanetTag = {
            planetID: id,
            tagKey: tagKey,
            tagValue: tagValue
          };

          await this.planetTagRepository.create(planetTag);
        });
    });
  }

  public async getExportData(): Promise<CSVExportData<PlanetWithSpreadTags>> {
    const planetRepository = new PlanetRepository(this.database);

    const planetData = await planetRepository.getAllWithTags();

    const planetsWithSpreadTags = planetData.map((planet) => {
      const { tagObject, ...planetData } = planet;

      const tagValuesSpread = {} as PlanetTagSpread;
      Object.keys(tagObject).forEach((key) => {
        tagValuesSpread[key] = tagObject[key].join(', ');
      });

      return { ...planetData, ...tagValuesSpread } as PlanetWithSpreadTags;
    });

    const columnKeys: CSVColumn[] = [];

    Object.keys(planetsWithSpreadTags[0]).forEach((key) =>
      columnKeys.push({
        key: key,
        header: key
      })
    );

    return {
      columnKeys: columnKeys,
      rows: planetsWithSpreadTags
    };
  }
}
