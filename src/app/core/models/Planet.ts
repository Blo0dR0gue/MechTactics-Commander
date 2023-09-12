import { Circle } from '../utils/quadtree/Circle';
import { Affiliation } from './Affiliation';
import { PlanetAffiliationJSON } from '../types/PlanetAffiliation';

class Planet extends Circle {
  private name: string;
  private affiliationId: number;
  private link: string;
  private affiliation: Affiliation;

  public constructor(probs: PlanetAffiliationJSON) {
    super({ x: probs.x, y: probs.y, r: 5 });
    this.name = probs.planetName;
    this.affiliationId = probs.affiliationId;
    this.link = probs.link;
    this.affiliation = new Affiliation(probs.nameAffiliation, probs.color);
  }

  public getColor() {
    return this.affiliation.getColor();
  }
}

export { Planet };
