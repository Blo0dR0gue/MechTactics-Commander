interface Window {
  sql: {
    getAllPlanets: () => Promise<
      import('./src/app/types/PlanetJson').PlanetJSON[]
    >;
    getAllAffiliations: () => Promise<
      import('./src/app/types/AffiliationJson').AffiliationJSON[]
    >;
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
    restartAndUpdate: () => void;
  };
}
