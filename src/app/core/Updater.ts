import { MessageBoxOptions, dialog, ipcMain } from 'electron';
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
        'update-version',
        info.version
      );
    });

    autoUpdater.on('download-progress', (info: ProgressInfo) => {
      // TODO: Use update page and progress data
      this.windowController.currentWindow.sendIpc(
        'download-progress',
        info.percent
      );
    });

    autoUpdater.on('update-downloaded', (event: UpdateDownloadedEvent) => {
      const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: 'A new version has been downloaded',
        detail:
          'A new version has been downloaded. Restart the application to apply the updates.',
      } as MessageBoxOptions;
      // TODO: Use update page and the event data
      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
      });
    });
  }
}

export { Updater };
