export type PlanetData = {
  id: number;
  name: string;
  x: number;
  y: number;
  link: string;
};

export type PlanetCoordData = {
  id: number;
  name: string;
  coord: {
    x: number;
    y: number;
  };

  link: string;
};

export type PlanetWithAffiliationAndAge = PlanetData & {
  affiliationID: number;
  age: number;
  planetText: string;
};
