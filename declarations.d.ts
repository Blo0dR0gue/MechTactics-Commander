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
    getAllPlanetAffiliationAges: () => Promise<
      import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData[]
    >;
    getAllPlanetAffiliationAgesWithNames: () => Promise<
      import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeWithNamesData[]
    >;
    getAllUniverseAges: () => Promise<Set<number>>;

    // Manipulation queries
    updatePlanet: (
      planet: import('./src/app/types/PlanetData').PlanetData
    ) => Promise<boolean>;
    createPlanet: (
      planet: import('./src/app/types/UtilityTypes').ForcefullyOmit<
        import('./src/app/types/PlanetData').PlanetData,
        'id'
      >
    ) => Promise<import('./src/app/types/PlanetData').PlanetData>;
    deletePlanet: (planetID: number) => Promise<boolean>;

    updateAffiliation: (
      affiliation: import('./src/app/types/AffiliationData').AffiliationData
    ) => Promise<boolean>;
    createAffiliation: (
      affiliation: import('./src/app/types/UtilityTypes').ForcefullyOmit<
        import('./src/app/types/AffiliationData').AffiliationData,
        'id'
      >
    ) => Promise<import('./src/app/types/AffiliationData').AffiliationData>;
    deleteAffiliation: (affiliationID: number) => Promise<boolean>;

    updatePlanetAffiliationAge: (
      data: import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData
    ) => Promise<boolean>;
    createPlanetAffiliationAge: (
      data: import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData
    ) => Promise<
      import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData
    >;
    createPlanetAffiliationAges: (
      dataPoints: import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData[]
    ) => Promise<
      import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData[]
    >;
    deletePlanetAffiliationAge: (
      data: import('./src/app/types/PlanetAffiliationAge').PlanetAffiliationAgeData
    ) => Promise<boolean>;
  };

  app: {
    version: () => Promise<string>;
    setConfigData: (key: string, value: unknown) => void;
    getConfigCache: () => Promise<Record<string, unknown>>;
    exportTableToCSV: (
      tableName: import('./src/app/types/UtilityTypes').DatabaseTables
    ) => Promise<void>;
    importTableFromCSV: (
      tableName: import('./src/app/types/UtilityTypes').DatabaseTables
    ) => Promise<void>;
    exportDatabaseToCSVs: () => Promise<void>[];
    importDatabaseFromCSVs: () => Promise<void>[];
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
