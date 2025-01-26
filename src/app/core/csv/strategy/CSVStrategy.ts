import { Database } from 'sqlite';
import { DatabaseTables } from '../../../types/UtilityTypes';

export type CSVColumn = { key: string; header: string };

export type CSVExportData<DataType> = {
  columnKeys: CSVColumn[];
  rows: DataType[];
};

export abstract class CSVStrategy<DataType> {
  protected database: Database;
  protected tableName: DatabaseTables;

  public constructor(database: Database, tableName: DatabaseTables) {
    this.database = database;
    this.tableName = tableName;
  }

  /**
   * Imports a csv object row to the database.
   *
   * @param {object} data A row object of a csv.
   */
  abstract importEntry(data: DataType): Promise<void>;

  /**
   * Provider for the data of a database table to export it in a csv file.
   */
  abstract getExportData(): Promise<CSVExportData<DataType>>;
}
