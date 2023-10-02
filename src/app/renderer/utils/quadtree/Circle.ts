// Lightweight fork of https://github.com/timohausmann/quadtree-ts/ to support negative numbers

import { Vector } from '../../models/Vector';

interface CircleGeometry {
  /**
   * Coordinate of the center of the circle
   */
  coord: Vector;

  /**
   * Radius of the circle.
   */
  r: number;
}

interface CircleProp {
  /**
   * X center of the circle
   */
  x: number;

  /**
   * Y center of the circle
   */
  y: number;

  /**
   * Radius of the circle.
   */
  r: number;
}

export class Circle implements CircleGeometry {
  /**
   * Coordinate of the center of the circle
   */
  coord: Vector;

  /**
   * Radius of the circle.
   */
  r: number;

  /**
   * Circle Constructor
   * @param props - Circle properties
   */
  constructor(props: CircleProp) {
    this.coord = new Vector(props.x, props.y);
    this.r = props.r;
  }

  /**
   * Check if a circle intersects an axis aligned rectangle.
   * @beta
   * @see https://yal.cc/rectangle-circle-intersection-test/
   * @param x - circle center X
   * @param y - circle center Y
   * @param r - circle radius
   * @param minX - rectangle start X
   * @param minY - rectangle start Y
   * @param maxX - rectangle end X
   * @param maxY - rectangle end Y
   * @returns true if circle intersects rectangle
   *
   * @example Check if a circle intersects a rectangle:
   * ```javascript
   * const circ = { x: 10, y: 20, r: 30 };
   * const rect = { x: 40, y: 50, width: 60, height: 70 };
   * const intersect = Circle.intersectRect(
   *   circ.x,
   *   circ.y,
   *   circ.r,
   *   rect.x,
   *   rect.y,
   *   rect.x + rect.width,
   *   rect.y + rect.height,
   * );
   * console.log(circle, rect, 'intersect?', intersect);
   * ```
   */
  static intersectRect(
    x: number,
    y: number,
    r: number,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): boolean {
    const deltaX = x - Math.max(minX, Math.min(x, maxX));
    const deltaY = y - Math.max(minY, Math.min(y, maxY));
    return deltaX * deltaX + deltaY * deltaY < r * r;
  }

  /**
   * Check for intersects or touches
   * @param c2 The seconds circle
   * @returns True, if the circles intersect or touch.
   */
  public intersect(c2: Circle): boolean {
    return (
      Math.sqrt(
        (this.coord.getX() - c2.coord.getX()) *
          (this.coord.getX() - c2.coord.getX()) +
          (this.coord.getY() - c2.coord.getY()) *
            (this.coord.getY() - c2.coord.getY())
      ) <=
      this.r + c2.r
    );
  }
}
