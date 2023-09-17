import { Heap } from './Heap';

// TODO: Handle ignore of planets or affiliations
class AStarPathfinding<Type> {
  private pathTo(state: Type, parent: Map<Type, Type>): Type[] {
    const element = parent.get(state);
    if (element === state) {
      return [state];
    }
    return this.pathTo(element, parent).concat([state]);
  }

  public search(
    start: Type,
    goal: Type,
    next_elements: (element: Type) => Type[],
    heuristic: (elementA: Type, elementB: Type) => number
  ) {
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
      const element = frontier.pop();
      if (element === goal) {
        return this.pathTo(goal, parent);
      }

      const elementDist = distance.get(element);
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
  }
}

export { AStarPathfinding };
