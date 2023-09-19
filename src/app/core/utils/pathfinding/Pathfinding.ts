abstract class Pathfinding<Type> {
  protected pathTo(state: Type, parent: Map<Type, Type>): Type[] {
    const element = parent.get(state);
    if (element === state) {
      return [state];
    }
    return this.pathTo(element, parent).concat([state]);
  }

  protected combinePath(
    state: Type,
    parentA: Map<Type, Type>,
    parentB: Map<Type, Type>
  ): Type[] {
    const path1 = this.pathTo(state, parentA);
    const path2 = this.pathTo(state, parentB);
    return path1.slice(0, -1).concat(path2.reverse());
  }

  abstract search(
    start: Type,
    goal: Type,
    next_elements: (element: Type) => Type[],
    heuristic?: (elementA: Type, elementB: Type) => number
  ): Type[];
}

export { Pathfinding };
