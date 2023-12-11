import { WindowBase } from './WindowBase';
import { MainWindow } from './main/MainWindow';

import { UpdateWindow } from './update/UpdateWindow';
import { Updater } from '../Updater';
import { CoreConfig } from '../CoreConfig';
import { Database } from 'sqlite';
import { DashboardWindow } from './dashboard/DashboarrdWindow';

class WindowController {
  public currentWindow: WindowBase;

  private isDevelopment: boolean;

  public constructor(isDevelopment: boolean) {
    this.isDevelopment = isDevelopment;
  }

  public openMainWindow(database: Database, config: CoreConfig) {
    this.setWindow(new MainWindow(this.isDevelopment, database, config));
  }

  public openUpdateWindow(updater: Updater) {
    this.setWindow(new UpdateWindow(this.isDevelopment, updater));
  }

  public openDashboardWindow(database: Database) {
    this.setWindow(new DashboardWindow(this.isDevelopment, database));
  }

  private setWindow(newWindow: WindowBase) {
    if (this.currentWindow) {
      this.currentWindow.close();
      this.currentWindow = newWindow;
    } else {
      this.currentWindow = newWindow;
    }
  }
}

export { WindowController };
