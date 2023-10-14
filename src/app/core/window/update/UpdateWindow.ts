import { WindowBase } from '../WindowBase';
import * as path from 'path';

class UpdateWindow extends WindowBase {
  public constructor(isDevelopment: boolean) {
    super(isDevelopment, 'update.html', path.join(__dirname, 'preload.js'));
  }

  protected setupHandler() {}
}

export { UpdateWindow };
