import { BiBreadthFirstSearch } from '../utils/pathfinding/BiBreadthFirstSearch';
import { Pathfinding } from '../utils/pathfinding/Pathfinding';
import { Universe } from '../ui/Universe';
import { Planet } from '../models/Planet';
import { Affiliation } from '../models/Affiliation';

// TODO: Rework to store more information about jumps. like is it possible to reach (so that we can draw that correct!)
class RouteController {
  private universe: Universe;
  private pathfinding: Pathfinding<Planet>;

  private targetPlanets: Planet[];
  private route: Planet[];
  private excludeAffiliation: Set<Affiliation>;

  public constructor() {}

  /**
   * Start the controller
   * @param universe
   */
  public init(universe: Universe): void {
    this.universe = universe;
    this.pathfinding = new BiBreadthFirstSearch();
    this.targetPlanets = [];
    this.route = [];
    this.excludeAffiliation = new Set();
  }

  /**
   * Add a planet to the route planing array
   * @param planet The planet to add
   */
  public addTargetPlanet(planet: Planet): void {
    // Don't add the same planet behind each other
    if (this.targetPlanets[this.targetPlanets.length - 1] === planet) return;
    this.targetPlanets.push(planet);
  }

  /**
   * Clears the route planing array
   */
  public clearTargetPlanets(): void {
    this.targetPlanets = [];
  }

  /**
   * Clears the route planing array
   */
  public clearRoute(): void {
    this.route = [];
  }

  /**
   * Removes the first occurrence of a planet in the route planing array.
   * @param planet The planet to remove
   */
  public removeTargetPlanet(planet: Planet): void {
    const index = this.targetPlanets.indexOf(planet);
    this.removeIndexOfTargetPlanet(index);
  }

  /**
   * Removes the first occurrence of a planet in the route planing array by its Name.
   * @param planetName The planet to remove
   */
  public removeTargetPlanetByName(planetName: string): void {
    const planet = this.targetPlanets.find(
      (planet) => planet.getName() === planetName
    );
    const index = this.targetPlanets.indexOf(planet);
    this.removeIndexOfTargetPlanet(index);
  }

  /**
   * Removes an index from the route planing array
   * @param index The index to remove
   */
  public removeIndexOfTargetPlanet(index: number): void {
    if (index >= this.targetPlanets.length || index < 0) return;
    this.targetPlanets.splice(index, 1);
  }

  /**
   * Removes all occurrences of a planet in the route planing array.
   * @param planet The planet to remove
   */
  public removeTargetPlanetAll(planet: Planet): void {
    let index = this.targetPlanets?.indexOf(planet);
    while (index >= 0) {
      this.removeIndexOfTargetPlanet(index);
      index = this.targetPlanets.indexOf(planet);
    }
  }

  /**
   * Checks if a planet is inside the target planets
   * @param planet The planet to check
   * @returns True, if the planet is already inside the target planets
   */
  public containsPlanet(planet: Planet): boolean {
    return this.targetPlanets?.indexOf(planet) !== -1 || false;
  }

  /**
   * Checks if a planet is inside the routes
   * @param planet The planet to check
   * @returns True, if the planet is inside the route
   */
  public routeContainsPlanet(planet: Planet): boolean {
    return this.route?.indexOf(planet) !== -1 || false;
  }

  /**
   * Returns the last planet in the target planet (destination)
   * @returns The destination planet or null
   */
  public getLastPlanet(): Planet | null {
    if (this.targetPlanets?.length === 0) return null;
    return this.targetPlanets[this.targetPlanets.length - 1];
  }

  /**
   * Adds an affiliation the the excluded list.
   * @param affiliation The affiliation to add
   */
  public addExcludedAffiliation(affiliation: Affiliation) {
    this.excludeAffiliation.add(affiliation);
  }

  /**
   * Removes an affiliation from the excluded list.
   * @param affiliation The affiliation to add
   */
  public removeExcludedAffiliation(affiliation: Affiliation) {
    this.excludeAffiliation.delete(affiliation);
  }

  /**
   * Calculates the whole route to each planet in the route planing array.
   * @param jumpRange The max range a ship can jump in light years.
   * @returns true, if a route got generated
   */
  public calculateRoute(jumpRange: number): boolean {
    if (this.targetPlanets.length < 2) return false;
    this.route = [];

    for (let i = 0; i < this.targetPlanets.length - 1; i++) {
      const p1 = this.targetPlanets[i];
      const p2 = this.targetPlanets[i + 1];
      const route = this.findRoute(p1, p2, jumpRange);

      if (route !== undefined) {
        if (i > 0) this.route.pop();
        this.route = this.route.concat(route);
      }
    }
    console.log(this.route);
    return true;
  }

  public lengthOfTargetPlanets(): number {
    return this.targetPlanets?.length || 0;
  }

  public getRoute(): Planet[] {
    return this.route || [];
  }

  public getNumberOfJumpsBetween(): number[] {
    const jumps = [] as number[];
    for (let i = 0; i < this.targetPlanets.length - 1; i++) {
      const indexStart = this.route.indexOf(this.targetPlanets[i]);
      const indexDestination = this.route.indexOf(this.targetPlanets[i + 1]);
      if (indexStart === -1 || indexDestination === -1) jumps.push(Infinity);
      else jumps.push(indexDestination - indexStart);
    }
    return jumps;
  }

  public getNumberOfJumpsBetweenIDs(
    start: number,
    destination: number
  ): number {
    const indexStart = this.route.indexOf(this.targetPlanets[start]);
    const indexDestination = this.route.indexOf(
      this.targetPlanets[destination]
    );
    if (indexStart === -1 || indexDestination === -1) return Infinity;
    return indexDestination - indexStart;
  }

  /**
   * Calculates the shortest route from planet a to planet b
   *
   * @param start The start planet
   * @param goal The destination planet
   * @param jumpRange The max range a ship can jump
   * @returns The route from planet a to planet b
   */
  private findRoute(start: Planet, goal: Planet, jumpRange): Planet[] {
    const result = this.pathfinding.search(
      start,
      goal,
      (element: Planet) =>
        this.universe
          .getAllInRange(element.coord, jumpRange)
          // Filter out excluded affiliations but not start and finish
          .filter(
            (planet) =>
              !Array.from(this.excludeAffiliation)
                .map((affiliation) => affiliation.getID())
                .includes(planet.getAffiliationID()) ||
              planet === start ||
              planet === goal
          ),
      (elementA: Planet, elementB: Planet) =>
        elementA.coord.distance(elementB.coord)
    );
    return result;
  }
}

export { RouteController };
