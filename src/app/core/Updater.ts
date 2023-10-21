import {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
  autoUpdater,
} from 'electron-updater';
import { WindowController } from './window/WindowController';
import { AppUpgradeInfo } from './AppUpgradeInfo';
import sqlite3 = require('sqlite3');
import { CoreConfig } from './CoreConfig';
import { app } from 'electron';

class Updater {
  private windowController: WindowController;
  private database: sqlite3.Database;
  private config: CoreConfig;
  private upgradeRunning: boolean;

  private readonly appUpgradeInfoMap: Record<string, AppUpgradeInfo> = {
    '0.0.8': {
      version: '0.0.8',
      description: 'Added core features, route settings and planet search',
      actions: [
        async () => {
          this.config.set('version', '0.0.8');
          this.config.set('jumpRange', 30);
          this.config.set('excludedAffiliationIDs', []);
        },
      ],
    },
  };

  public constructor(
    windowController: WindowController,
    database: sqlite3.Database,
    config: CoreConfig
  ) {
    this.windowController = windowController;
    this.database = database;
    this.config = config;
    this.setupHandlers();
  }

  public checkForUpdates() {
    autoUpdater.checkForUpdates();
  }

  private isUpgradeNeeded() {
    const currentVersion = this.config.get('version');
    for (const version in this.appUpgradeInfoMap) {
      if (version > currentVersion) {
        this.upgradeRunning = true;
        return true; // Upgrade is needed
      }
    }
    this.upgradeRunning = false;
    return false; // No upgrades are needed
  }

  private async handleAppUpgrade() {
    const currentVersion = this.config.get('version');
    const upgradeVersions = Object.keys(this.appUpgradeInfoMap).filter(
      (version) => version > currentVersion
    );

    const actionsLength = upgradeVersions
      .map((value) => this.appUpgradeInfoMap[value].actions.length)
      .reduce((acc, curr) => acc + curr, 0);

    let executedActions = 0;

    for (const version of upgradeVersions) {
      const upgradeInfo = this.appUpgradeInfoMap[version];

      this.windowController.currentWindow.sendIpc(
        'updateText',
        `Upgrading to version ${upgradeInfo.version} - ${upgradeInfo.description}`,
        false
      );

      for (const action of upgradeInfo.actions) {
        await action(); // Perform action and wait for it to finish
        executedActions++;
        // Send upgrade percentage
        this.windowController.currentWindow.sendIpc(
          'updatePercentage',
          (executedActions / actionsLength) * 100
        );
      }
    }
    this.windowController.currentWindow.sendIpc(
      'updateText',
      `Upgrade finished. Restart the app.`,
      true
    );
  }

  public restartAndUpdate() {
    if (this.upgradeRunning) {
      // TODO: Remove the need to restart after upgrade. just start app
      app.relaunch();
      app.quit();
    } else {
      autoUpdater.quitAndInstall();
    }
  }

  private setupHandlers() {
    autoUpdater.on('checking-for-update', () => {
      this.windowController.openUpdateWindow(this);
      console.log('Checking for updates...');
    });

    autoUpdater.on('update-not-available', () => {
      console.log('No update available.');
      console.log('Checking for upgrades...');
      if (this.isUpgradeNeeded()) {
        setTimeout(() => {
          this.windowController.currentWindow.sendIpc(
            'updateTitle',
            `Upgrade in progress`
          );
          this.handleAppUpgrade();
        }, 1000);
      } else {
        console.log('Everything up-to-date.');
        this.windowController.openMainWindow(this.database, this.config);
      }
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.windowController.currentWindow.sendIpc(
        'updateTitle',
        `Update in progress`
      );
      this.windowController.currentWindow.sendIpc(
        'updateText',
        `Downloading new update. Version: ${info.version}`,
        false
      );
    });

    autoUpdater.on('download-progress', (info: ProgressInfo) => {
      this.windowController.currentWindow.sendIpc(
        'updatePercentage',
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
