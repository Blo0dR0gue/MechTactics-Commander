import { Vector } from '../models/Vector';

type PlanetAffiliationJSON = {
  planetName: string;
  x: number;
  y: number;
  affiliationId: number;
  link: string;
  nameAffiliation: string;
  color: string;
};

type PlanetAffiliation = {
  planetName: string;
  coord: Vector;
  affiliationId: number;
  link: string;
  nameAffiliation: string;
  color: string;
};

export { PlanetAffiliationJSON, PlanetAffiliation };
