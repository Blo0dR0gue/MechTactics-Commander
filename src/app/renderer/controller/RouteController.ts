import { BiBreadthFirstSearch } from '../utils/pathfinding/BiBreadthFirstSearch';
import { Pathfinding } from '../utils/pathfinding/Pathfinding';
import { Universe } from '../ui/Universe';
import { Planet } from '../models/Planet';

class RouteController {
  private universe: Universe;
  private pathfinding: Pathfinding<Planet>;

  private targetPlanets: Planet[];
  private route: Planet[];

  public constructor(universe: Universe) {
    this.universe = universe;
    this.pathfinding = new BiBreadthFirstSearch();
    this.targetPlanets = [];
    this.route = [];
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
   * Removes the first occurrence of a planet in the route planing array.
   * @param planet The planet to remove
   */
  public removeTargetPlanet(planet: Planet): void {
    const index = this.targetPlanets.indexOf(planet);
    this.removeIndexOfTargetPlanet(index);
  }

  /**
   * Removes an index from the route planing array
   * @param index The index to remove
   */
  public removeIndexOfTargetPlanet(index: number): void {
    if (index >= this.targetPlanets.length || index < 0) return;
    this.targetPlanets.slice(index, 1);
  }

  /**
   * Removes all occurrences of a planet in the route planing array.
   * @param planet The planet to remove
   */
  public removeTargetPlanetAll(planet: Planet): void {
    let index = this.targetPlanets.indexOf(planet);
    while (index >= 0) {
      this.removeIndexOfTargetPlanet(index);
      index = this.targetPlanets.indexOf(planet);
    }
  }

  /**
   * Calculates the whole route to each planet in the route planing array.
   * @param jumpRange The max range a ship can jump in light years.
   */
  public calculateRoute(jumpRange: number): void {
    if (this.targetPlanets.length < 2) return;
    this.route = [];

    for (let i = 0; i < this.targetPlanets.length - 1; i++) {
      const p1 = this.targetPlanets[i];
      const p2 = this.targetPlanets[i + 1];
      const route = this.findRoute(p1, p2, jumpRange);
      this.route = this.route.concat(route);
    }
  }

  public getRoute(): Planet[] {
    return this.route;
  }

  public getNumberOfJumps(): number {
    return this.route.length - 1;
  }

  /**
   * Calculates the shortest route from planet a to planet b
   *
   * @param planetA The start planet
   * @param planetB The destination planet
   * @param jumpRange The max range a ship can jump
   * @returns The route from planet a to planet b
   */
  private findRoute(planetA: Planet, planetB: Planet, jumpRange): Planet[] {
    const result = this.pathfinding.search(
      planetA,
      planetB,
      (element: Planet) =>
        this.universe.getAllInRange(element.coord, jumpRange),
      (elementA: Planet, elementB: Planet) =>
        elementA.coord.distance(elementB.coord)
    );
    return result;
  }
}

export { RouteController };
