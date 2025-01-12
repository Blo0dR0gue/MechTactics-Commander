type PlanetData = {
  id: number;
  name: string;
  x: number;
  y: number;
  link: string;
  tags: PlanetTags;
  fuelingStation: boolean;
  details: string;
  type: string;
};
type PlanetCoordData = {
  id: number;
  name: string;
  coord: {
    x: number;
    y: number;
  };

  link: string;
  tags: PlanetTags;
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
