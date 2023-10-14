import { WindowBase } from '../WindowBase';
import * as path from 'path';

class MainWindow extends WindowBase {
  public constructor(isDevelopment: boolean) {
    super(isDevelopment, 'index.html', path.join(__dirname, 'preload.js'));
  }

  protected setupHandler() {}
}

export { MainWindow };
