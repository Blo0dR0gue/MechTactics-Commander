interface Window {
  sql: {
    planets: () => Promise<
      import('./src/app/types/PlanetAffiliation').PlanetAffiliationJSON[]
    >;
  };
  app: {
    version: () => Promise<string>;
    setConfigData: (key: string, value: unknown) => void;
    getConfigCache: () => Promise<Record<string, unknown>>;
  };
}
