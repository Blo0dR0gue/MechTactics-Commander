import { Vector } from '../renderer/models/map/Vector';

type PlanetJSON = {
  name: string;
  coord: Vector;
  affiliation: number;
  link: string;
  r?: number;
};

export { PlanetJSON };
