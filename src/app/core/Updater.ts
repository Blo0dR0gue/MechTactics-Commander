import { MessageBoxOptions, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

class Updater {
  public constructor(onNoUpdate: () => void, onUpdate: () => void) {
    this.setupHandlers(onNoUpdate, onUpdate);
  }

  public checkForUpdates() {
    autoUpdater.checkForUpdates();
  }

  private setupHandlers(onNoUpdate: () => void, onUpdate: () => void) {
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking');
    });

    autoUpdater.on('update-not-available', () => {
      console.log('No update available.');
      onNoUpdate();
    });

    autoUpdater.on('update-available', () => {
      const dialogOpts = {
        type: 'info',
        buttons: ['Ok'],
        title: 'Application Update',
        message: 'Downloading a new version',
        detail: 'Downloading a new version',
      } as MessageBoxOptions;
      onUpdate();
      dialog.showMessageBox(dialogOpts);
    });

    autoUpdater.on('update-downloaded', () => {
      const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: 'A new version has been downloaded',
        detail:
          'A new version has been downloaded. Restart the application to apply the updates.',
      } as MessageBoxOptions;
      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
      });
    });
  }
}

export { Updater };
