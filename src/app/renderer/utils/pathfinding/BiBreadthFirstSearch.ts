import { Pathfinding } from './Pathfinding';

class BiBreadthFirstSearch<Type extends NonNullable<unknown>> extends Pathfinding<Type> {
  search(start: Type, goal: Type, next_elements: (element: Type) => Type[]): Type[] | undefined {
    let frontierA = new Set<Type>();
    frontierA.add(start);
    const parentA = new Map<Type, Type>();
    parentA.set(start, start);

    let frontierB = new Set<Type>();
    frontierB.add(goal);
    const parentB = new Map<Type, Type>();
    parentB.set(goal, goal);

    while (frontierA.size > 0 && frontierB.size > 0) {
      let newFrontier = new Set<Type>();

      for (const state of frontierA) {
        for (const next of next_elements(state)) {
          if (!parentA.has(next)) {
            newFrontier.add(next);
            parentA.set(next, state);
            if (parentB.has(next)) {
              return this.combinePath(next, parentA, parentB);
            }
          }
        }
      }

      frontierA = newFrontier;
      newFrontier = new Set();

      for (const state of frontierB) {
        for (const next of next_elements(state)) {
          if (!parentB.has(next)) {
            newFrontier.add(next);
            parentB.set(next, state);
            if (parentA.has(next)) {
              return this.combinePath(next, parentA, parentB);
            }
          }
        }
      }
      frontierB = newFrontier;
    }
    return undefined;
  }
}

export { BiBreadthFirstSearch };
