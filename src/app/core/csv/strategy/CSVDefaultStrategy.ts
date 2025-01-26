import { CSVColumn, CSVExportData, CSVStrategy } from './CSVStrategy';

export class CSVDefaultStrategy extends CSVStrategy<object> {
  public async importEntry(data: object): Promise<void> {
    const databaseKeys = Object.keys(data).join(', ');
    const values = Object.values(data)
      .map((value) => `"${value}"`)
      .join(', ');
    const query = `INSERT OR REPLACE INTO ${this.tableName} (${databaseKeys}) VALUES (${values})`;
    await this.database.run(query);
  }

  public async getExportData(): Promise<CSVExportData<object>> {
    const rows = await this.database.all(`SELECT * FROM ${this.tableName};`);

    const columnKeys = Object.keys(rows[0]).map((key) => {
      return {
        key: key,
        header: key
      } as CSVColumn;
    });

    return { columnKeys: columnKeys, rows: rows };
  }
}
