import { Database } from 'sqlite';
import { WindowBase } from '../WindowBase';
import * as path from 'path';

class DashboardWindow extends WindowBase {
  private database: Database;

  public constructor(isDevelopment: boolean, database: Database) {
    super(isDevelopment, 'dashboard.html', path.join(__dirname, 'preload.js'));
    this.database = database;
  }

  protected setupHandler() {}
}

export { DashboardWindow };
