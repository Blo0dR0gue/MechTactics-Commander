interface Window {
  sql: {
    getPlanetsAtAge: (
      age: number
    ) => Promise<import('./src/app/types/PlanetData').PlanetResponse[]>;
    getAllPlanets: () => Promise<
      import('./src/app/types/PlanetData').PlanetResponse[]
    >;
    getAllAffiliations: () => Promise<
      import('./src/app/types/AffiliationData').AffiliationResponse[]
    >;
    getAllUniverseAges: () => Promise<
      {
        universeAge: number;
      }[]
    >;
    updatePlanetText: (id: number, universeAge: string, text: string) => void;

    // Dashboard
    updatePlanet: (
      planet: import('./src/app/types/PlanetData').PlanetRequest
    ) => Promise<import('./src/app/types/PlanetData').PlanetRequest>;
    createPlanet: (
      planet: import('./src/app/types/PlanetData').PlanetRequest
    ) => Promise<import('./src/app/types/PlanetData').PlanetRequest>;
    deletePlanet: (
      planet: import('./src/app/types/PlanetData').PlanetRequest
    ) => Promise<boolean>;

    updateAffiliation: (
      affiliation: import('./src/app/types/AffiliationData').AffiliationRequest
    ) => Promise<import('./src/app/types/AffiliationData').AffiliationRequest>;
    createAffiliation: (
      affiliation: import('./src/app/types/AffiliationData').AffiliationRequest
    ) => Promise<import('./src/app/types/AffiliationData').AffiliationRequest>;
    deleteAffiliation: (
      affiliation: import('./src/app/types/AffiliationData').AffiliationRequest
    ) => Promise<boolean>;

    addPlanetToAge: (
      planet: import('./src/app/types/PlanetData').PlanetRequest,
      age: number
    ) => Promise<import('./src/app/types/PlanetData').PlanetRequest>;

    addPlanetsToAge: (
      planets: import('./src/app/types/PlanetData').PlanetRequest[],
      age: number
    ) => Promise<boolean>;
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
