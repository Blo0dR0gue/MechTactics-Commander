type PlanetData = {
  id: number;
  name: string;
  x: number;
  y: number;
  link: string;
};

type PlanetCoordData = {
  id: number;
  name: string;
  coord: {
    x: number;
    y: number;
  };

  link: string;
};

type PlanetWithAffiliationAndAge = PlanetData & {
  affiliationID: number;
  age: number;
  planetText: string;
};

export { PlanetData, PlanetCoordData, PlanetWithAffiliationAndAge };
