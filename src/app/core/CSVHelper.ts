import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'csv';
import { dialog } from 'electron/main';
import { AppWindow } from './window/AppWindow';
import { Database, ISqlite } from 'sqlite';
import { Statement } from 'sqlite3';
import { DatabaseTables } from '../types/UtilityTypes';
import PlanetAffiliationAgeDynFormatter from '../renderer/utils/components/formatter/PlanetAffiliationAgeDynFormatter';

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
        if (tableName === 'PlanetAffiliationAge') {
          // We need to convert the one line per planet to multi lines per planet for each age like in the database

          const affiliationIDKeys = Object.keys(data).filter((key) =>
            key.includes('affiliationID')
          );

          if (affiliationIDKeys.length === 0) {
            reject('No affiliation data found');
            return;
          }

          const ages = affiliationIDKeys.reduce((acc, key) => {
            if (data[key]) {
              acc.push(key.replace('affiliationID', ''));
            }
            return acc;
          }, []);

          const databaseKeys = [
            'universeAge',
            'planetID',
            'affiliationID',
            'planetText',
          ];

          ages.forEach((age) => {
            const elem = {
              universeAge: age,
              planetID: data['planetID'],
              affiliationID: data[`affiliationID${age}`],
              planetText: data[`planetText${age}`],
            };
            const values = Object.values(elem)
              .map((value) => `"${value}"`)
              .join(', ');
            const query = `INSERT OR REPLACE INTO ${tableName} (${databaseKeys}) VALUES (${values})`;
            insertPromises.push(database.run(query));
          });
        } else {
          const databaseKeys = Object.keys(data).join(', ');
          const values = Object.values(data)
            .map((value) => `"${value}"`)
            .join(', ');
          const query = `INSERT OR REPLACE INTO ${tableName} (${databaseKeys}) VALUES (${values})`;
          insertPromises.push(database.run(query));
        }
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
  let rows = await database.all(`SELECT * FROM ${tableName};`);

  const columnKeys: {
    key: string;
    header: string;
  }[] = [];

  if (tableName === 'PlanetAffiliationAge') {
    // We need to export the PlanetAffiliationAge in a different way then the other tables, because one planet can be in different affiliations in different universe ages.
    // The Customer wants to have one row per planet in the CSV-file.

    // TODO: Clean way via database instance
    // Get all ages stored in the database
    let ages = await database.all(
      'SELECT DISTINCT universeAge FROM PlanetAffiliationAge;'
    );
    ages = ages.reduce((acc, val) => {
      acc.add(val.universeAge);
      return acc;
    }, new Set<number>());

    // Format the data from the database to archive the structure of DynamicPlanetAffiliationConnectData
    const formatter = new PlanetAffiliationAgeDynFormatter();
    const formattedData = formatter.format(rows);

    columnKeys.push({
      header: 'planetID',
      key: 'planetID',
    });

    ages.forEach((age) => {
      // Add headers fo the affiliation-id and the planet-text for the different universe ages we have
      columnKeys.push({
        header: `affiliationID${age}`,
        key: `affiliationData.age${age}.affiliationID`,
      });
      columnKeys.push({
        header: `planetText${age}`,
        key: `affiliationData.age${age}.planetText`,
      });
    });

    rows = formattedData;
  } else {
    Object.keys(rows[0]).forEach((key) =>
      columnKeys.push({
        key: key,
        header: key,
      })
    );
  }

  return writeDataToCSV(rows, columnKeys, csvFilePath);
}

async function writeDataToCSV(
  dataRows: object[],
  columnKeys: {
    key: string;
    header: string;
  }[],
  pathToCSV: string
) {
  return new Promise<void>((resolve, reject) => {
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
