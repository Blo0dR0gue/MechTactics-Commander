// declarations.d.ts
interface Window {
  sql: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO: remove any
    planets: () => Promise<any>; // Adjust the type as needed for your use case
  };
}
