interface Window {
  sql: {
    planets: () => Promise<
      import('./src/app/core/types/PlanetAffiliation').PlanetAffiliationJSON[]
    >;
  };
}
