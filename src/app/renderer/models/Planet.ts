import { PlanetTags } from '../../types/PlanetData';
import { Circle } from '../utils/quadtree/Circle';
import { Affiliation } from './Affiliation';

// TODO: Rework this class so it only knows information about planet not in which age it is used etc.

class Planet extends Circle {
  private id: number;
  private name: string;
  private link: string;
  private text: string;
  private affiliation: Affiliation;
  private universeAge: number;
  private tags: PlanetTags;
  private fuelingStation: boolean;
  private details: string;
  private type: string;

  /**
   * Creates a new planet object
   * @param id The ID of the planet
   * @param name The name of the planet
   * @param x The x coordinate
   * @param y The y coordinate
   * @param link Link to the wiki page
   * @param text Custom text for the planet
   * @param affiliation Affiliation object {@link Affiliation}
   * @param universeAge Universe age this planet is used in
   * @param tags Tags for the planet
   * @param fuelingStation Indicates if this planet has a fueling station
   * @param details Additional details about the planet
   * @param type Star type category
   */
  constructor(
    id: number,
    name: string,
    x: number,
    y: number,
    link: string,
    text: string,
    affiliation: Affiliation,
    universeAge: number,
    tags: PlanetTags,
    fuelingStation: boolean,
    details: string,
    type: string
  ) {
    super({ x, y, r: 0.01 });
    this.id = id;
    this.name = name;
    this.link = link;
    this.text = text;
    this.affiliation = affiliation;
    this.universeAge = universeAge;
    this.tags = tags;
    this.fuelingStation = fuelingStation;
    this.details = details;
    this.type = type;
  }

  // Private Methods
  private hasFuelingStation(): boolean {
    return this.fuelingStation;
  }

  private getDetails(): string {
    return this.details;
  }

  private getType(): string {
    return this.type;
  }

  private updateInDB(): void {
    window.sql
      .updatePlanet({
        id: this.id,
        x: this.coord.getX(),
        y: this.coord.getY(),
        link: this.link,
        name: this.name,
        tags: this.tags,
        details: this.details,
        fuelingStation: this.fuelingStation,
        type: this.type,
      })
      .then(() => {
        window.sql.updatePlanetAffiliationAge({
          planetID: this.id,
          affiliationID: this.getAffiliationID(),
          universeAge: this.universeAge,
          planetText: this.text,
        });
      });
  }

  // Public Methods
  public getID(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getWikiURL(): string {
    return this.link;
  }

  public getText(): string {
    return this.text;
  }

  public setText(text: string): void {
    this.text = text;
    this.updateInDB();
  }

  public getTags(): PlanetTags {
    return this.tags;
  }

  public getTagByKey(tagKey: string): string[] | null {
    return this.tags[tagKey] ?? null;
  }

  public getAffiliationID(): number {
    return this.affiliation.getID();
  }

  public getAffiliationName(): string {
    return this.affiliation.getName();
  }

  public getColor(): string {
    return this.affiliation.getColor();
  }
}

export { Planet };
