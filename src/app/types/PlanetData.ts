type PlanetData = {
  id: number;
  name: string;
  x: number;
  y: number;
  link: string;
  tags: PlanetTags;
  fuelingStation: boolean;
  detail: string;
  type: string;
};
type PlanetCoordData = Omit<PlanetData, 'x' | 'y'> & {
  coord: {
    x: number;
    y: number;
  };
};

export type PlanetTags = {
  [tag: string]: string[];
};

type PlanetWithAffiliationAndAge = PlanetData & {
  affiliationID: number;
  age: number;
  planetText: string;
};

export { PlanetData, PlanetCoordData, PlanetWithAffiliationAndAge };
