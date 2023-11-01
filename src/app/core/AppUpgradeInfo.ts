import { Database } from 'sqlite';
import { CoreConfig } from './CoreConfig';

abstract class AppUpgradeInfo {
  public version: string;
  public description: string;
  public actions: (() => Promise<void>)[];
  protected config: CoreConfig;
  protected database: Database;

  public constructor(
    config: CoreConfig,
    database: Database,
    version: string,
    description: string
  ) {
    this.config = config;
    this.database = database;
    this.actions = [];
    this.version = version;
    this.description = description;
  }
}

export { AppUpgradeInfo };
