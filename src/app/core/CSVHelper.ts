import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'csv';
import { dialog } from 'electron/main';
import { AppWindow } from './window/AppWindow';
import { Database, ISqlite } from 'sqlite';
import { Statement } from 'sqlite3';

async function selectCSVDestination(window: AppWindow, save: boolean) {
  const destinationData = await dialog.showOpenDialog(window.getWindow(), {
    title: save ? 'Speichern unter...' : 'Laden',
    properties: ['openDirectory', 'createDirectory'],
  });
  return destinationData?.filePaths[0];
}

type DatabaseTables = 'Planet' | 'Affiliation' | 'PlanetAffiliationAge';

async function insertCSVIntoTable(
  database: Database,
  tableName: DatabaseTables,
  csvFolderPath: string
) {
  const csvPath = csvFolderPath + path.sep + tableName + '.csv';

  const insertPromises: Promise<ISqlite.RunResult<Statement>>[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(parse({ delimiter: ';', columns: true, encoding: 'utf-8' }))
      .on('data', (data) => {
        const keys = Object.keys(data).join(', ');
        const values = Object.values(data)
          .map((value) => `"${value}"`)
          .join(', ');
        const query = `INSERT OR REPLACE INTO ${tableName} (${keys}) VALUES (${values})`;
        insertPromises.push(database.run(query));
      })
      .on('end', () => {
        Promise.all(insertPromises)
          .then(() => resolve())
          .catch((err) => reject(err));
      });
  });
}

async function writeDataToCSV(dataRows: object[], pathToCSV: string) {
  return new Promise<void>((resolve, reject) => {
    const columnKeys = Object.keys(dataRows[0]).map((key) => ({
      key: key,
      header: key,
    }));

    stringify(
      dataRows,
      {
        header: true,
        columns: columnKeys,
        delimiter: ';',
        encoding: 'utf-8',
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

async function exportTableToCSV(
  database: Database,
  tableName: DatabaseTables,
  csvFolderPath: string
) {
  const csvPath = csvFolderPath + path.sep + tableName + '.csv';
  const rows = await database.all(`SELECT * FROM ${tableName};`);
  await writeDataToCSV(rows, csvPath);
}

async function exportDatabaseToCSVs(window: AppWindow, database: Database) {
  const csvFolderPath = await selectCSVDestination(window, false);

  if (!csvFolderPath) {
    return;
  }

  await exportTableToCSV(database, 'Planet', csvFolderPath);
  await exportTableToCSV(database, 'Affiliation', csvFolderPath);
  await exportTableToCSV(database, 'PlanetAffiliationAge', csvFolderPath);
}

async function importCSVsIntoDatabase(window: AppWindow, database: Database) {
  const csvFolderPath = await selectCSVDestination(window, false);

  if (!csvFolderPath) {
    return;
  }

  await insertCSVIntoTable(database, 'Planet', csvFolderPath);
  await insertCSVIntoTable(database, 'Affiliation', csvFolderPath);
  await insertCSVIntoTable(database, 'PlanetAffiliationAge', csvFolderPath);
}

export { exportDatabaseToCSVs, importCSVsIntoDatabase };
