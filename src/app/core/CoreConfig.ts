import { app } from 'electron';
import ElectronStore from 'electron-store';
import * as path from 'path';
import { AppConstants } from './AppConstants';

class CoreConfig {
  private config: ElectronStore;

  public constructor(isDevelopment: boolean) {
    this.config = new ElectronStore({
      cwd: isDevelopment
        ? path.join(AppConstants.ROOT_DIR, '../')
        : app.getPath('userData'),
    });
  }

  public set(key: string, value: unknown): void {
    this.config.set(key, value);
  }

  public get(key: string): unknown {
    return this.config.get(key);
  }

  public size(): number {
    return this.config.size;
  }

  public getConfig(): Record<string, unknown> {
    return this.config.store;
  }
}

export { CoreConfig };
