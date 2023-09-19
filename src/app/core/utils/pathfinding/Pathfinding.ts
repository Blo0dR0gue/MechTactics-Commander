abstract class Pathfinding<Type> {
  protected pathTo(state: Type, parent: Map<Type, Type>): Type[] {
    const element = parent.get(state);
    if (element === state) {
      return [state];
    }
    return this.pathTo(element, parent).concat([state]);
  }

  abstract search(
    start: Type,
    goal: Type,
    next_elements: (element: Type) => Type[],
    heuristic: (elementA: Type, elementB: Type) => number
  ): Type[];
}

export { Pathfinding };
