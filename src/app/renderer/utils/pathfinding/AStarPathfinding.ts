import { Heap } from './Heap';
import { Pathfinding } from './Pathfinding';

// TODO: Handle ignore of planets or affiliations
// TODO: COMMENTS, TESTS

class AStarPathfinding<Type extends NonNullable<unknown>> extends Pathfinding<Type> {
  public search(
    start: Type,
    goal: Type,
    next_elements: (element: Type) => Type[],
    heuristic: (elementA: Type, elementB: Type) => number
  ): Type[] | undefined {
    const parent = new Map<Type, Type>();
    parent.set(start, start);

    const distance = new Map<Type, number>();
    distance.set(start, 0);

    const estGoal = heuristic(start, goal);
    const estimate = new Map<Type, number>();
    estimate.set(start, estGoal);

    const frontier = new Heap<Type>();
    frontier.add(start, estGoal);

    while (frontier.size() > 0) {
      const element = frontier.pop().element;
      if (element === goal) {
        return this.pathTo(goal, parent);
      }

      const elementDist = distance.get(element) as number;
      for (const next of next_elements(element)) {
        const oldEstimate = estimate.get(next) || undefined;
        const newEstimate = elementDist + 1 + heuristic(next, goal);
        if (oldEstimate === undefined || newEstimate < oldEstimate) {
          distance.set(next, elementDist + 1);
          estimate.set(next, newEstimate);
          parent.set(next, element);
          if (oldEstimate === undefined) {
            frontier.add(next, newEstimate);
          } else {
            frontier.updateItem(next, newEstimate);
          }
        }
      }
    }
    return undefined;
  }
}

export { AStarPathfinding };
