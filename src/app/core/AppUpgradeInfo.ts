interface AppUpgradeInfo {
  version: string;
  description: string;
  actions: (() => Promise<void>)[];
}

export { AppUpgradeInfo };
