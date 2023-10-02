import { Vector } from '../renderer/models/Vector';

type PlanetJSON = {
  name: string;
  coord: Vector;
  affiliation: number;
  link: string;
  r?: number;
};

export { PlanetJSON };
