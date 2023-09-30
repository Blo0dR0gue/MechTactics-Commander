interface Window {
  sql: {
    planets: () => Promise<
      import('./src/app/types/PlanetAffiliation').PlanetAffiliationJSON[]
    >;
  };
}
