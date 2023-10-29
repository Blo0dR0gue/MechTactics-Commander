interface Window {
  sql: {
    getAllPlanets: (
      age: string
    ) => Promise<import('./src/app/types/PlanetJson').PlanetJSON[]>;
    getAllAffiliations: (
      age: string
    ) => Promise<import('./src/app/types/AffiliationJson').AffiliationJSON[]>;
  };
  app: {
    version: () => Promise<string>;
    setConfigData: (key: string, value: unknown) => void;
    getConfigCache: () => Promise<Record<string, unknown>>;
    addDownloadProgressListener: (
      callback: (event: Electron.IpcRendererEvent, percent: number) => void
    ) => void;
    addUpdateTextListener: (
      callback: (
        event: Electron.IpcRendererEvent,
        text: string,
        finished: boolean
      ) => void
    ) => void;
    addUpdateTitleListener: (
      callback: (event: Electron.IpcRendererEvent, text: string) => void
    ) => void;
    restartAndUpdate: () => void;
  };
}
