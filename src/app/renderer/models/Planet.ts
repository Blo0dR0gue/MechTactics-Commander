import { PlanetTags, PlanetTagMap, PlanetTagValue } from '../../types/PlanetData';
import { Circle } from '../utils/quadtree/Circle';
import { Affiliation } from './Affiliation';

// TODO: Rework this class so it only knows information about planet not in which age it is used etc.

class Planet extends Circle {
  private id: number;
  private name: string;
  private link: string;
  private customText: string;
  private affiliation: Affiliation;
  private universeAge: number;
  private tagMap: PlanetTagMap;
  private fuelingStation: boolean;
  private detail: string;
  private type: string;

  /**
   * Creates a new planet object
   * @param id The ID of the planet
   * @param name The name of the planet
   * @param x The x coordinate
   * @param y The y coordinate
   * @param link Link to the wiki page
   * @param customText Custom text for the planet
   * @param affiliation Affiliation object {@link Affiliation}
   * @param universeAge Universe age this planet is used in
   * @param tagList Tags for the planet
   * @param fuelingStation Indicates if this planet has a fueling station
   * @param detail Additional details about the planet
   * @param type Star type category
   */
  constructor(
    id: number,
    name: string,
    x: number,
    y: number,
    link: string,
    customText: string,
    affiliation: Affiliation,
    universeAge: number,
    tagList: PlanetTags,
    fuelingStation: boolean,
    detail: string,
    type: string
  ) {
    super({ x, y, r: 0.01 });
    this.id = id;
    this.name = name;
    this.link = link;
    this.customText = customText;
    this.affiliation = affiliation;
    this.universeAge = universeAge;
    this.tagMap = new Map(Object.entries(tagList ?? {}));
    this.fuelingStation = fuelingStation;
    this.detail = detail;
    this.type = type;
  }

  // Private Methods

  private updateInDB(): void {
    window.sql
      .updatePlanet({
        id: this.id,
        x: this.coord.getX(),
        y: this.coord.getY(),
        link: this.link,
        name: this.name,
        tagList: Object.fromEntries(this.tagMap),
        detail: this.detail,
        fuelingStation: this.fuelingStation,
        type: this.type
      })
      .then(() => {
        window.sql.updatePlanetAffiliationAge({
          planetID: this.id,
          affiliationID: this.getAffiliationID(),
          universeAge: this.universeAge,
          planetText: this.customText
        });
      });
  }

  // Public Methods
  public hasFuelingStation(): boolean {
    return this.fuelingStation;
  }

  public getDetail(): string {
    return this.detail;
  }

  public getType(): string {
    return this.type;
  }

  public getID(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getWikiURL(): string {
    return this.link;
  }

  public getCustomText(): string {
    return this.customText;
  }

  public setCustomText(customText: string): void {
    this.customText = customText;
    this.updateInDB();
  }

  public getTags(): PlanetTagMap {
    return this.tagMap;
  }

  public getTagByKey(tagKey: string): PlanetTagValue[] | null {
    return this.tagMap.get(tagKey) ?? null;
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
