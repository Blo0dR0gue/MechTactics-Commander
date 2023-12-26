type PlanetResponse = {
  id: number;
  name: string;
  x: number;
  y: number;
  link: string;
  planetText: string;
  affiliationID: number;
  age?: number;
};

type PlanetRequest = {
  coordinates: {
    x: number;
    y: number;
  };
  id: number;
  name: string;
  link: string;
  planetText: string;
  affiliationID: number;
  age: number;
};

export { PlanetResponse, PlanetRequest };
