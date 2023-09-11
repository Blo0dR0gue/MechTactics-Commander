interface Window {
  sql: {
    planets: () => Promise<
      import('./src/app/core/types/PlanetAffiliation').PlanetAffiliation[]
    >;
    getAffiliation: (
      id: number
    ) => Promise<import('./src/app/core/models/Affiliation').Affiliation>;
  };
}
