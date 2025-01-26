import fs from 'fs';
import { parse, stringify } from 'csv';
import { dialog } from 'electron/main';
import { AppWindow } from '../window/AppWindow';
import { Database } from 'sqlite';
import { DatabaseTables } from '../../types/UtilityTypes';
import {
  CSVStrategy,
  CSVDefaultStrategy,
  CSVPlanetAffiliationAgeStrategy,
  CSVPlanetTagsStrategy
} from './strategy';

export class CSVHelper {
  private window: AppWindow;
  private database: Database;

  public constructor(windows: AppWindow, database: Database) {
    this.window = windows;
    this.database = database;
  }

  public async importTableFromCSV(tableName: DatabaseTables): Promise<void> {
    const strategy = this.databaseTableToStrategy(tableName);

    const csvFilePath = await this.selectCSVDestination(false, false);

    if (csvFilePath === null) {
      return;
    }

    const insertPromises: Promise<void>[] = [];

    let transactionStarted = false;

    return new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(parse({ delimiter: ';', columns: true, encoding: 'utf-8' }))
        .on('data', (data) => {
          if (!transactionStarted) {
            this.database.run('BEGIN TRANSACTION;');
            transactionStarted = true;
          }

          insertPromises.push(strategy.importEntry(data));
        })
        .on('end', () => {
          Promise.all(insertPromises)
            .then(() => {
              this.database.run('COMMIT;');
              resolve();
            })
            .catch((err) => {
              this.database.run('ROLLBACK;');
              reject(err);
            });
        })
        .on('error', (err) => {
          this.database.run('ROLLBACK;');
          reject(err);
        });
    });
  }

  public async exportTableToCSV(tableName: DatabaseTables): Promise<void> {
    const strategy = this.databaseTableToStrategy(tableName);

    const csvFilePath = await this.selectCSVDestination(true, false);

    if (csvFilePath === null) {
      return;
    }

    const { columnKeys, rows } = await strategy.getExportData();

    return this.writeDataToCSV(rows, columnKeys, csvFilePath);
  }

  private async selectCSVDestination(
    save: boolean,
    dir?: boolean
  ): Promise<string | null> {
    if (save && !dir) {
      const destinationData = await dialog.showSaveDialog(
        this.window.getWindow(),
        {
          title: 'Save At...',
          filters: [{ name: 'CSV', extensions: ['csv'] }],
          properties: ['createDirectory']
        }
      );
      const csvPath = destinationData?.filePath.trim() || null;
      return destinationData.canceled ? null : csvPath;
    } else {
      const destinationData = await dialog.showOpenDialog(
        this.window.getWindow(),
        {
          title: 'Load',
          filters: [{ name: 'CSV', extensions: ['csv'] }],
          properties: [dir ? 'openDirectory' : 'openFile', 'createDirectory']
        }
      );
      const csvPath = destinationData?.filePaths[0]?.trim() || null;
      return destinationData.canceled ? null : csvPath;
    }
  }

  private async writeDataToCSV(
    dataRows: object[],
    columnKeys: {
      key: string;
      header: string;
    }[],
    pathToCSV: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      stringify(
        dataRows,
        {
          header: true,
          columns: columnKeys,
          delimiter: ';',
          encoding: 'utf-8'
        },
        (err, output) => {
          fs.writeFile(pathToCSV, output, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      );
    });
  }

  private databaseTableToStrategy(
    tableName: DatabaseTables
  ): CSVStrategy<object> {
    switch (tableName) {
      case 'PlanetWithTagsView':
        return new CSVPlanetTagsStrategy(this.database, tableName);
      case 'PlanetAffiliationAge':
        return new CSVPlanetAffiliationAgeStrategy(this.database, tableName);
      default:
        return new CSVDefaultStrategy(this.database, tableName);
    }
  }
}
