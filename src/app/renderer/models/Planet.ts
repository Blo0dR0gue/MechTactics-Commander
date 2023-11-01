import { Circle } from '../utils/quadtree/Circle';
import { Affiliation } from './Affiliation';

/**
 * Represents a new planet
 */
class Planet extends Circle {
  /**
   * The id
   */
  private id: number;

  /**
   * The name of this planet
   */
  private name: string;
  /**
   * The link to the wiki page
   */
  private link: string;
  /**
   * Custom text for the planet
   */
  private text: string;
  /**
   * The affiliation object {@link Affiliation}
   */
  private affiliation: Affiliation;

  /**
   * Creates a new planet
   * @param probs Properties for this planet
   */
  public constructor(
    id: number,
    name: string,
    x: number,
    y: number,
    link: string,
    text: string,
    affiliation: Affiliation
  ) {
    super({ x: x, y: y, r: 0.01 });
    this.id = id;
    this.name = name;
    this.link = link;
    this.text = text;
    this.affiliation = affiliation;
  }

  /**
   * Gets thee id of this planet
   * @returns The id of the planet
   */
  public getID(): number {
    return this.id;
  }

  /**
   * Gets the name of this planet
   *
   * @returns The name of the planet
   */
  public getName(): string | null {
    return this.name;
  }

  /**
   * Gets the custom text of this planet
   * @returns The custom text or null
   */
  public getText(): string {
    return this.text;
  }

  /**
   * Sets the custom text of this planet
   * @param text The new text
   */
  public setText(text: string): void {
    this.text = text;
    // FIXME: Static universe age
    window.sql.updatePlanetText(this.id, '3025', this.text);
  }

  /**
   * Gets the color of the affiliation
   * @returns The color for this planet (affiliation)
   */
  public getColor(): string {
    return this.affiliation.getColor();
  }

  public getAffiliationID(): number {
    return this.affiliation.getID();
  }

  public getAffiliationName(): string {
    return this.affiliation.getName();
  }

  public getWikiURL(): string {
    return this.link;
  }
}

export { Planet };
