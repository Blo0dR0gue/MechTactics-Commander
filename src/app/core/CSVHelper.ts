import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'csv';
import { dialog } from 'electron/main';
import { AppWindow } from './window/AppWindow';
import { Database, ISqlite } from 'sqlite';
import { Statement } from 'sqlite3';
import { DatabaseTables } from '../types/UtilityTypes';

async function selectCSVDestination(
  window: AppWindow,
  save: boolean,
  dir?: boolean
) {
  if (save && !dir) {
    const destinationData = await dialog.showSaveDialog(window.getWindow(), {
      title: 'Speichern unter...',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
      properties: ['createDirectory'],
    });
    return destinationData?.filePath;
  } else {
    const destinationData = await dialog.showOpenDialog(window.getWindow(), {
      title: 'Laden',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
      properties: [dir ? 'openDirectory' : 'openFile', 'createDirectory'],
    });
    return destinationData?.filePaths[0];
  }
}

async function importTableFromCSV(
  database: Database,
  tableName: DatabaseTables,
  csvPath: string
) {
  let csvFilePath;
  if (csvPath.endsWith('.csv')) {
    csvFilePath = csvPath;
  } else {
    csvFilePath = csvPath + path.sep + tableName + '.csv';
  }

  const insertPromises: Promise<ISqlite.RunResult<Statement>>[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
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

async function exportTableToCSV(
  database: Database,
  tableName: DatabaseTables,
  csvPath: string
) {
  let csvFilePath;
  if (csvPath.endsWith('.csv')) {
    csvFilePath = csvPath;
  } else {
    csvFilePath = csvPath + path.sep + tableName + '.csv';
  }
  const rows = await database.all(`SELECT * FROM ${tableName};`);
  return writeDataToCSV(rows, csvFilePath);
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

async function exportDatabaseToCSVs(window: AppWindow, database: Database) {
  const csvFolderPath = await selectCSVDestination(window, true, true);

  if (!csvFolderPath) {
    return;
  }

  const exports: Promise<void>[] = [];

  exports.push(exportTableToCSV(database, 'Planet', csvFolderPath));
  exports.push(exportTableToCSV(database, 'Affiliation', csvFolderPath));
  exports.push(
    exportTableToCSV(database, 'PlanetAffiliationAge', csvFolderPath)
  );

  return Promise.all(exports);
}

async function importDatabaseFromCSVs(window: AppWindow, database: Database) {
  const csvFolderPath = await selectCSVDestination(window, false, true);

  if (!csvFolderPath) {
    return;
  }

  const exports: Promise<void>[] = [];

  exports.push(importTableFromCSV(database, 'Planet', csvFolderPath));
  exports.push(importTableFromCSV(database, 'Affiliation', csvFolderPath));
  exports.push(
    importTableFromCSV(database, 'PlanetAffiliationAge', csvFolderPath)
  );

  return Promise.all(exports);
}

export {
  selectCSVDestination,
  exportTableToCSV,
  importTableFromCSV,
  exportDatabaseToCSVs,
  importDatabaseFromCSVs,
};
