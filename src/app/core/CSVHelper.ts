import fs from 'fs';
import { parse, stringify } from 'csv';

async function insertCSVIntoDatabase(pathToCSV: string, tableName: string) {
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(pathToCSV).pipe(
      parse(
        { delimiter: ';', columns: true, encoding: 'utf-8' },
        (err, records, info) => {
          console.log(err);
          console.log(records);
          console.log(info);
          resolve();
        }
      )
    );
  });
}

async function exportDatabaseToCSV(pathToCSV: string, tableName: string) {
  return new Promise<void>((resolve, reject) => {
    stringify(
      [{ id: 0, name: 'Terra', x: 13.13, y: 12.3 }],
      {
        header: true,
        columns: ['id', 'name', 'x', 'y'],
        delimiter: ';',
        encoding: 'utf-8',
      },
      async (err, output) => {
        console.log(err);
        console.log(output);
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

export { insertCSVIntoDatabase, exportDatabaseToCSV };
