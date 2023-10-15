import * as path from 'path';

class AppConstants {
  public static ROOT_DIR = path.join(__dirname, '..' + path.sep);
  public static RENDERER_DIR = path.join(this.ROOT_DIR, 'renderer', path.sep);
  public static PAGES_DIR = path.join(this.RENDERER_DIR, 'pages', path.sep);
}

export { AppConstants };
