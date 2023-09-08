import { Circle } from '../utils/quadtree/Circle';
import { PlanetJSON } from '../types/PlanetJson';

class Planet extends Circle {
  private name: string;
  private affiliation: string;
  private link: string;

  public constructor(probs: PlanetJSON) {
    super({ x: probs.x, y: probs.y, r: 5 });
    this.name = probs.name;
    this.affiliation = probs.affiliation;
    this.link = probs.link;
  }
}

export { Planet };
