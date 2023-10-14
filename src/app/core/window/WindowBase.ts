import { BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import { AppConstants } from '../AppConstants';

abstract class WindowBase {
  protected window: BrowserWindow;

  public constructor(
    isDevelopment: boolean,
    htmlFileName: string,
    preloadFileName: string
  ) {
    const size = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    this.window = new BrowserWindow({
      height: size.height,
      width: size.width,
      minHeight: 850,
      minWidth: 1700,
      webPreferences: {
        preload: path.join(preloadFileName),
        devTools: isDevelopment ? true : false,
      },
    });

    this.window.loadFile(path.join(AppConstants.PAGES_DIR, htmlFileName));
    this.window.maximize();

    if (isDevelopment) {
      // Open the DevTools.
      setTimeout(() => {
        this.window.webContents.openDevTools();
      }, 1000);
    } else {
      this.window.removeMenu();
    }

    this.setupHandler();
  }

  public close(): void {
    this.window.close();
    ipcMain.removeAllListeners();
  }

  public sendIpc(channel: string, ...message): void {
    console.log(`Sending ${message} to ${channel}`);
    this.window.webContents.send(channel, ...message);
  }

  protected abstract setupHandler(): void;
}

export { WindowBase };
