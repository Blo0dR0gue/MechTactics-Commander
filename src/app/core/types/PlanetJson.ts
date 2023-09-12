import { Vector } from '../models/map/Vector';

type PlanetJSON = {
  name: string;
  coord: Vector;
  affiliation: number;
  link: string;
  r?: number;
};

export { PlanetJSON };
