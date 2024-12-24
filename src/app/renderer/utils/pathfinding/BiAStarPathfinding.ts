import { Heap } from './Heap';
import { Pathfinding } from './Pathfinding';

// TODO: Handle ignore of planets or affiliations
// TODO: COMMENTS, TESTS

class BiAStarPathfinding<Type extends NonNullable<unknown>> extends Pathfinding<Type> {
  public search(
    start: Type,
    goal: Type,
    next_elements: (element: Type) => Type[],
    heuristic: (elementA: Type, elementB: Type) => number
  ): Type[] | undefined {
    const parentA = new Map<Type, Type>();
    parentA.set(start, start);

    const parentB = new Map<Type, Type>();
    parentB.set(goal, goal);

    const distanceA = new Map<Type, number>();
    distanceA.set(start, 0);

    const distanceB = new Map<Type, number>();
    distanceB.set(goal, 0);

    const estGoal = heuristic(start, goal);
    const estimateA = new Map<Type, number>();
    estimateA.set(start, estGoal);

    const estimateB = new Map<Type, number>();
    estimateB.set(goal, estGoal);

    const frontierA = new Heap<Type>();
    frontierA.add(start, estGoal);

    const frontierB = new Heap<Type>();
    frontierB.add(goal, estGoal);

    while (frontierA.size() > 0 && frontierB.size() > 0) {
      const { element: elementA, priority: priorityA } = frontierA.pop();
      const { element: elementB, priority: priorityB } = frontierB.pop();

      const distA = distanceA.get(elementA) as number;
      const distB = distanceB.get(elementB) as number;

      if (priorityA <= priorityB) {
        frontierB.add(elementB, priorityB);
        for (const next of next_elements(elementA)) {
          const oldEstimate = estimateA.get(next) || undefined;
          const newEstimate = distA + 1 + heuristic(next, goal);
          if (oldEstimate === undefined || newEstimate < oldEstimate) {
            distanceA.set(next, distA + 1);
            estimateA.set(next, newEstimate);
            parentA.set(next, elementA);
            if (oldEstimate === undefined) {
              frontierA.add(next, newEstimate);
            } else {
              frontierA.updateItem(next, newEstimate);
            }
          }
          if (distanceB.has(next)) {
            return this.combinePath(next, parentA, parentB);
          }
        }
      } else {
        frontierA.add(elementA, priorityA);
        for (const next of next_elements(elementB)) {
          const oldEstimate = estimateB.get(next) || undefined;
          const newEstimate = distB + 1 + heuristic(start, next);
          if (oldEstimate === undefined || newEstimate < oldEstimate) {
            distanceB.set(next, distB + 1);
            estimateB.set(next, newEstimate);
            parentB.set(next, elementB);
            if (oldEstimate === undefined) {
              frontierB.add(next, newEstimate);
            } else {
              frontierB.updateItem(next, newEstimate);
            }
          }
          if (distanceA.has(next)) {
            return this.combinePath(next, parentA, parentB);
          }
        }
      }
    }
    return undefined;
  }
}

export { BiAStarPathfinding };
