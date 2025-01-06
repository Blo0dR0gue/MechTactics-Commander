interface Window {
  sql: {
    getPlanetsAtAge: (age: number) => Promise<import('../types/PlanetData').PlanetWithAffiliationAndAge[]>;
    getAllPlanets: () => Promise<import('../types/PlanetData').PlanetData[]>;
    getAllAffiliations: () => Promise<import('../types/AffiliationData').AffiliationData[]>;
    getAllPlanetAffiliationAges: () => Promise<import('../types/PlanetAffiliationAge').PlanetAffiliationAgeData[]>;
    getAllPlanetAffiliationAgesWithNames: () => Promise<import('../types/PlanetAffiliationAge').PlanetAffiliationAgeWithNamesData[]>;
    getAllUniverseAges: () => Promise<Set<number>>;

    // Manipulation queries
    updatePlanet: (planet: import('../types/PlanetData').PlanetData) => Promise<boolean>;
    createPlanet: (planet: import('../types/PlanetData').PlanetData) => Promise<import('../types/PlanetData').PlanetData>;
    deletePlanet: (planet: import('../types/PlanetData').PlanetData) => Promise<boolean>;

    updateAffiliation: (affiliation: import('../types/AffiliationData').AffiliationData) => Promise<boolean>;
    createAffiliation: (
      affiliation: import('../types/AffiliationData').AffiliationData
    ) => Promise<import('../types/AffiliationData').AffiliationData>;
    deleteAffiliation: (affiliation: import('../types/AffiliationData').AffiliationData) => Promise<boolean>;

    updatePlanetAffiliationAge: (data: import('../types/PlanetAffiliationAge').PlanetAffiliationAgeData) => Promise<boolean>;
    createPlanetAffiliationAge: (
      data: import('../types/PlanetAffiliationAge').PlanetAffiliationAgeData
    ) => Promise<import('../types/PlanetAffiliationAge').PlanetAffiliationAgeData>;
    createPlanetAffiliationAges: (
      dataPoints: import('../types/PlanetAffiliationAge').PlanetAffiliationAgeData[]
    ) => Promise<import('../types/PlanetAffiliationAge').PlanetAffiliationAgeData[]>;
    deletePlanetAffiliationAge: (data: import('../types/PlanetAffiliationAge').PlanetAffiliationAgeData) => Promise<boolean>;
  };

  app: {
    version: () => Promise<string>;
    setConfigData: (key: string, value: unknown) => void;
    getConfigCache: () => Promise<Record<string, unknown>>;
    exportTableToCSV: (tableName: import('../types/UtilityTypes').DatabaseTables) => Promise<void>;
    importTableFromCSV: (tableName: import('../types/UtilityTypes').DatabaseTables) => Promise<void>;
    exportDatabaseToCSVs: () => Promise<void>[];
    importDatabaseFromCSVs: () => Promise<void>[];
  };

  update: {
    addDownloadProgressListener: (callback: (event: Electron.IpcRendererEvent, percent: number) => void) => void;
    addUpdateTextListener: (callback: (event: Electron.IpcRendererEvent, text: string, finished: boolean) => void) => void;
    addUpdateTitleListener: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => void;
    restartAndUpdate: () => void;
  };
}
