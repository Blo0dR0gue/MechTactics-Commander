interface Window {
  sql: {
    getPlanetsAtAge: (
      age: number
    ) => Promise<
      import('./src/app/types/PlanetData').PlanetWithAffiliationAndAge[]
    >;
    getAllPlanets: () => Promise<
      import('./src/app/types/PlanetData').PlanetData[]
    >;
    getAllAffiliations: () => Promise<
      import('./src/app/types/AffiliationData').AffiliationData[]
    >;
    getAllUniverseAges: () => Promise<
      {
        universeAge: number;
      }[]
    >;

    // Dashboard
    updatePlanet: (
      planet: import('./src/app/types/PlanetData').PlanetData
    ) => Promise<boolean>;
    createPlanet: (
      planet: import('./src/app/types/PlanetData').PlanetData
    ) => Promise<import('./src/app/types/PlanetData').PlanetData>;
    deletePlanet: (
      planet: import('./src/app/types/PlanetData').PlanetData
    ) => Promise<boolean>;

    updateAffiliation: (
      affiliation: import('./src/app/types/AffiliationData').AffiliationData
    ) => Promise<boolean>;
    createAffiliation: (
      affiliation: import('./src/app/types/AffiliationData').AffiliationData
    ) => Promise<import('./src/app/types/AffiliationData').AffiliationData>;
    deleteAffiliation: (
      affiliation: import('./src/app/types/AffiliationData').AffiliationData
    ) => Promise<boolean>;

    addPlanetToAge: (
      planet: import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData
    ) => Promise<
      import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData
    >;

    addPlanetsToAge: (
      planets: import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData[]
    ) => Promise<
      import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData[]
    >;
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
