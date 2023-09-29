import { Circle } from '../../utils/quadtree/Circle';
import { Affiliation } from './Affiliation';
import { PlanetAffiliationJSON } from '../../types/PlanetAffiliation';

/**
 * Represents a new planet
 */
class Planet extends Circle {
  /**
   * The name of this planet
   */
  private name: string;
  /**
   * The id of the affiliation in the database
   */
  private affiliationId: number;
  /**
   * The link to the wiki page
   */
  private link: string;
  /**
   * The affiliation object {@link Affiliation}
   */
  private affiliation: Affiliation;

  /**
   * Creates a new planet
   * @param probs Properties for this planet
   */
  public constructor(probs: PlanetAffiliationJSON) {
    super({ x: probs.x, y: probs.y, r: 0.01 });
    this.name = probs.planetName;
    this.affiliationId = probs.affiliationId;
    this.link = probs.link;
    this.affiliation = new Affiliation(probs.nameAffiliation, probs.color);
  }

  /**
   * Gets the name of this planet
   * @returns The name of the planet
   */
  public getName() {
    return this.name;
  }

  /**
   * Gets the color of the affiliation
   * @returns The color for this planet (affiliation)
   */
  public getColor() {
    return this.affiliation.getColor();
  }
}

export { Planet };
