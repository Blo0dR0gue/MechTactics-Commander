class Config {
  public static INSTANCE: Config;

  private cache: Record<string, unknown>;

  private constructor() {}

  public static getInstance() {
    if (!Config.INSTANCE) {
      Config.INSTANCE = new Config();
    }
    return Config.INSTANCE;
  }

  public async buildCache() {
    this.cache = await window.app.getConfigCache();
  }

  public get(key: string): unknown {
    return this.cache[key];
  }

  public set(key: string, value: unknown) {
    this.cache[key] = value;
    return window.app.setConfigData(key, value);
  }
}

export { Config };
