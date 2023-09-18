import { AStarPathfinding } from '../../utils/pathfinding/AStarPathfinding';
import { Universe } from '../map/Universe';
import { Planet } from '../objects/Planet';

class RouteManager {
  private universe: Universe;
  private pathfinding: AStarPathfinding<Planet>;

  private targetPlanets: Planet[];
  private route: Planet[];

  public constructor(universe: Universe) {
    this.universe = universe;
    this.pathfinding = new AStarPathfinding();
    this.targetPlanets = [];
    this.route = [];
  }

  /**
   * Calculates the shortest route from planet a to planet b
   *
   * @param planetA The start planet
   * @param planetB The destination planet
   * @param jumpRange The max range a ship can jump (default = 30)
   * @returns The route from planet a to planet b
   */
  private findRoute(
    planetA: Planet,
    planetB: Planet,
    jumpRange = 30
  ): Planet[] {
    const result = this.pathfinding.search(
      planetA,
      planetB,
      (element: Planet) => {
        const data = this.universe.getAllInRange(element.coord, jumpRange);
        console.log(element, data);
        return data;
      },
      (elementA: Planet, elementB: Planet) => {
        return elementA.coord.distance(elementB.coord);
      }
    );
    return result;
  }
}

export { RouteManager };
