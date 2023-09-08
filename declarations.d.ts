interface Window {
  sql: {
    planets: () => Promise<import('./src/app/core/models/Planet').Planet[]>;
  };
}
