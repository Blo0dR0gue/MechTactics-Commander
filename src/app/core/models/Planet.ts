import { Circle } from '../utils/quadtree/Circle';

class Planet extends Circle {
  public constructor(x: number, y: number) {
    super({ x: x, y: y, r: 5 });
  }
}

export { Planet };
