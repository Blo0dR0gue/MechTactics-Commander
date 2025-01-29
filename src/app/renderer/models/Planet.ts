import {
  PlanetTagMap,
  PlanetTagValue,
  PlanetData
} from '../../types/PlanetData';
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
  private civilization: string;
  private population: string;
  private size: string;
  private jumpDistance: number;

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
   * @param tagObject Tags for the planet
   * @param fuelingStation Indicates if this planet has a fueling station
   * @param detail Additional details about the planet
   * @param type Star type category
   */
  constructor(
    props: PlanetData & {
      affiliation: Affiliation;
      universeAge: number;
      customText: string;
    }
  ) {
    super({ x: props.x, y: props.y, r: 0.01 });
    this.id = props.id;
    this.name = props.name;
    this.link = props.link;
    this.customText = props.customText;
    this.affiliation = props.affiliation;
    this.universeAge = props.universeAge;
    this.tagMap = new Map(Object.entries(props.tagObject ?? {}));
    this.fuelingStation = props.fuelingStation;
    this.detail = props.detail;
    this.type = props.type;
    this.civilization = props.civilization;
    this.population = props.population;
    this.size = props.size;
    this.jumpDistance = props.jumpDistance;
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
        tagObject: Object.fromEntries(this.tagMap),
        detail: this.detail,
        fuelingStation: this.fuelingStation,
        type: this.type,
        civilization: this.civilization,
        population: this.population,
        size: this.size,
        jumpDistance: this.jumpDistance
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
  public getCivilization(): string {
    return this.civilization;
  }

  public getPopulation(): string {
    return this.population;
  }

  public getSize(): string {
    return this.size;
  }

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
