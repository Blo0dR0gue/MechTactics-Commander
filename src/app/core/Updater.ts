import {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
  autoUpdater,
} from 'electron-updater';
import { Database } from 'sqlite';
import { CoreConfig } from './CoreConfig';
import appUpgradeInfos from './upgrades';
import { AppWindow } from './window/AppWindow';
import { AppUpgradeInfo } from './AppUpgradeInfo';

class Updater {
  private readonly appUpgradeInfoMap = appUpgradeInfos;

  public constructor(
    private database: Database,
    private config: CoreConfig,
    private appWindow: AppWindow
  ) {
    this.setupHandlers();
  }

  public checkForUpdates() {
    autoUpdater.checkForUpdates();
  }

  private isUpgradeNeeded() {
    const currentVersion = this.config.get('version') as string;
    for (const version in this.appUpgradeInfoMap) {
      if (version > currentVersion) {
        return true; // Upgrade is needed
      }
    }
    return false; // No upgrades are needed
  }

  private async handleAppUpgrade() {
    const currentVersion = this.config.get('version');
    // Get all upgrades todo
    const upgradeVersions = Object.keys(this.appUpgradeInfoMap).filter(
      (version) => version > currentVersion
    );
    // TODO: Rework to not create the upgrade objects here
    // Get the amount of actions todo
    const actionsLength = upgradeVersions
      .map(
        (value) =>
          new this.appUpgradeInfoMap[value](this.config, this.database).actions
            .length
      )
      .reduce((acc, curr) => acc + curr, 0);

    let executedActions = 0;

    // Execute actions per upgrade version one by one and update progress bar.
    for (const version of upgradeVersions) {
      const upgradeInfo = new this.appUpgradeInfoMap[version](
        this.config,
        this.database
      ) as AppUpgradeInfo;

      this.appWindow.sendIpc(
        'updateText',
        `Upgrading to version ${upgradeInfo.version} - ${upgradeInfo.description}`,
        false
      );

      for (const action of upgradeInfo.actions) {
        // TODO: Create log file???
        await action().catch((reason) => {
          console.log(reason);
        }); // Perform action and wait for it to finish and catch all errors.
        executedActions++;
        // Send upgrade percentage
        this.appWindow.sendIpc(
          'updatePercentage',
          (executedActions / actionsLength) * 100
        );
      }
    }

    // Upgrade finished
    this.appWindow.sendIpc(
      'updateText',
      `Upgrade finished. Starting app please wait.`,
      false
    );
    // Wait 4 sec before starting the app.
    setTimeout(() => {
      this.appWindow.loadPage('index.html');
    }, 4000);
  }

  private setupHandlers() {
    autoUpdater.on('checking-for-update', () => {
      this.appWindow.loadPage('update.html');
      console.log('Checking for updates...');
    });

    autoUpdater.on('update-not-available', () => {
      console.log('No update available.');
      console.log('Checking for upgrades...');
      if (this.isUpgradeNeeded()) {
        // TODO: Remove timeout and detect if window is visible
        setTimeout(() => {
          this.appWindow.sendIpc('updateTitle', `Upgrade in progress`);
          this.handleAppUpgrade();
        }, 1000);
      } else {
        console.log('Everything up-to-date.');
        this.appWindow.loadPage('index.html');
      }
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.appWindow.sendIpc('updateTitle', `Update in progress`);
      this.appWindow.sendIpc(
        'updateText',
        `Downloading new update. Version: ${info.version}`,
        false
      );
    });

    autoUpdater.on('download-progress', (info: ProgressInfo) => {
      this.appWindow.sendIpc('updatePercentage', info.percent);
    });

    autoUpdater.on('update-downloaded', (event: UpdateDownloadedEvent) => {
      this.appWindow.sendIpc(
        'updateText',
        `A new version (${event?.version}) has been downloaded. Restart the application to apply the updates.`,
        true
      );
    });
  }
}

export { Updater };
