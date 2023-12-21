interface Window {
  sql: {
    getPlanetsAtAge: (
      age: number
    ) => Promise<import('./src/app/types/PlanetResponse').PlanetResponse[]>;
    getAllAffiliations: () => Promise<
      import('./src/app/types/AffiliationResponse').AffiliationResponse[]
    >;
    getAllUniverseAges: () => Promise<
      {
        universeAge: number;
      }[]
    >;
    updatePlanetText: (id: number, universeAge: string, text: string) => void;
  };
  app: {
    version: () => Promise<string>;
    setConfigData: (key: string, value: unknown) => void;
    getConfigCache: () => Promise<Record<string, unknown>>;
  };
  update: {
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
