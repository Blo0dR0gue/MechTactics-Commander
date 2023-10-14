import {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
  autoUpdater,
} from 'electron-updater';
import { WindowController } from './window/WindowController';

class Updater {
  private windowController: WindowController;

  public constructor(windowController: WindowController) {
    this.windowController = windowController;
    this.setupHandlers();
  }

  public checkForUpdates() {
    autoUpdater.checkForUpdates();
  }

  public restartAndUpdate() {
    autoUpdater.quitAndInstall();
  }

  private setupHandlers() {
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking');
    });

    autoUpdater.on('update-not-available', () => {
      console.log('No update available.');
      this.windowController.openMainWindow();
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.windowController.openUpdateWindow();
      this.windowController.currentWindow.sendIpc(
        'updateText',
        `Downloading new update. Version: ${info.version}`,
        false
      );
    });

    autoUpdater.on('download-progress', (info: ProgressInfo) => {
      // TODO: Use update page and progress data
      this.windowController.currentWindow.sendIpc(
        'downloadProgress',
        info.percent
      );
    });

    autoUpdater.on('update-downloaded', (event: UpdateDownloadedEvent) => {
      this.windowController.currentWindow.sendIpc(
        'updateText',
        `A new version (${event?.version}) has been downloaded. Restart the application to apply the updates.`,
        true
      );
    });
  }
}

export { Updater };
