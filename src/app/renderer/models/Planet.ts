import { Circle } from '../utils/quadtree/Circle';
import { Affiliation } from './Affiliation';

class Planet extends Circle {
  /**
   * Creates a new planet object
   * @param id The id
   * @param name  The name of this planet
   * @param x The x coordinate
   * @param y The y coordinate
   * @param link The link to the wiki page
   * @param text Custom text for the planet
   * @param affiliation The affiliation object {@link Affiliation}
   * @param universeAge The universe age this planet object is used in
   */
  public constructor(
    private id: number,
    private name: string,
    x: number,
    y: number,
    private link: string,
    private text: string,
    private affiliation: Affiliation,
    private universeAge: number
  ) {
    super({ x: x, y: y, r: 0.01 });
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
  public getName(): string {
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
    this.updateInDB();
  }

  private updateInDB(): void {
    window.sql
      .updatePlanet({
        id: this.id,
        x: this.coord.getX(),
        y: this.coord.getY(),
        link: this.link,
        name: this.name
      })
      .then(() => {
        window.sql.updatePlanetAffiliationAge({
          planetID: this.id,
          affiliationID: this.getAffiliationID(),
          universeAge: this.universeAge,
          planetText: this.text
        });
      });
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
