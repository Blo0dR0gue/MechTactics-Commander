import { AppUpgradeInfo } from '../AppUpgradeInfo';
import { Database } from 'sqlite';
import { CoreConfig } from '../CoreConfig';

class Upgrade009 extends AppUpgradeInfo {
  public constructor(config: CoreConfig, database: Database) {
    super(config, database, '0.0.9', 'Test');
    this.actions.push(async () => {
      console.log('Upgrading config');
      this.config.set('version', '0.0.9');
    });
    this.actions.push(async () => {
      console.log('Upgrading Database');
      // Rename old tables
      await database.exec('ALTER TABLE Planet RENAME TO Planet_old;');
      await database.exec('ALTER TABLE Affiliation RENAME TO Affiliation_old;');

      // Create new table schemas
      await database.exec(
        'CREATE TABLE IF NOT EXISTS Affiliation(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, color TEXT);'
      );
      await database.exec(
        'CREATE TABLE IF NOT EXISTS UniverseAge(id INTEGER PRIMARY KEY AUTOINCREMENT, age TEXT);'
      );
      await database.exec(
        'CREATE TABLE IF NOT EXISTS Planet(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, link TEXT, x REAL, y REAL);'
      );
      await database.exec(
        'CREATE TABLE IF NOT EXISTS PlanetAffiliationAge(affiliationID INTEGER, universeAgeID INTEGER, planetID INTEGER, ' +
          'PRIMARY KEY(affiliationID, universeAgeID, planetID), FOREIGN KEY(affiliationID) REFERENCES Affiliation(id), ' +
          'FOREIGN KEY(universeAgeID) REFERENCES UniverseAge(id), FOREIGN KEY(planetID) REFERENCES Planet(id));'
      );

      // Insert current battletech map version
      await database.exec('INSERT INTO UniverseAge (age) VALUES ("3025")');

      /*
      FIX DATABASE LIKE THIS:
      PRAGMA foreign_keys = 1;
      CREATE TABLE IF NOT EXISTS Parent(id INTEGER PRIMARY KEY AUTOINCREMENT, name text);
      CREATE TABLE IF NOT EXISTS Child(id INTEGER PRIMARY KEY AUTOINCREMENT, name text, parent_id INTEGER, FOREIGN KEY (parent_id) REFERENCES Parent (id));
      INSERT INTO Child (name, parent_id) VALUES('test',1);
      INSERT INTO Child (name, parent_id) VALUES('test',77);
      */
    });
  }
}

export { Upgrade009 };
