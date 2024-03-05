import fs from 'fs';
import { parse } from 'csv';

function insertCSVIntoDatabase(pathToCSV: string, tableName: string) {
  fs.createReadStream(pathToCSV)
    .pipe(parse({ delimiter: ';', columns: true }))
    .on('data', function (row) {
      console.log(row);
    });
}

export { insertCSVIntoDatabase };
