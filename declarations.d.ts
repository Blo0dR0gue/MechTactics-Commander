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
  };
}
