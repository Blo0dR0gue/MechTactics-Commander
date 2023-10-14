import { ipcMain } from 'electron';
import { Updater } from '../../Updater';
import { WindowBase } from '../WindowBase';
import * as path from 'path';

class UpdateWindow extends WindowBase {
  private updater: Updater;
  public constructor(isDevelopment: boolean, updater: Updater) {
    super(isDevelopment, 'update.html', path.join(__dirname, 'preload.js'));
    this.updater = updater;
  }

  protected setupHandler() {
    ipcMain.handle('restartAndUpdate', () => {
      this.updater.restartAndUpdate();
    });
  }
}

export { UpdateWindow };
