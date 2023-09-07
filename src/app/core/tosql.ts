import data from './systems.json';
import Database from 'better-sqlite3';

const db = new Database(`${__dirname}/BattleTechCommander.db`, {
  verbose: console.log,
});

db.exec(
  "CREATE TABLE IF NOT EXISTS Planet('name' TEXT, 'link' TEXT, 'x' INTEGER, 'y' INTEGER, 'affiliation' TEXT)"
);

for (const planetJSON of data) {
  const link = planetJSON.link;
  const name = planetJSON.name.replace("'", "''");
  const x = planetJSON.x;
  const y = planetJSON.y;
  const affiliation = planetJSON.affiliation.replace("'", "''");
  db.exec(
    `INSERT INTO Planet ('name', 'link', 'x', 'y', 'affiliation') VALUES ('${name}', '${link}', ${x}, ${y}, '${affiliation}')`
  );
}
