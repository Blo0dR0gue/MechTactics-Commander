export type VectorProps = {
  x: number;
  y: number;
};

/**
 * Represents a two dimensional point
 */
class Vector {
  /**
   * The x coordinate of the vector
   */
  private x: number;
  /**
   * The y coordinate of the vector
   */
  private y: number;

  /**
   * Creates a new vector
   *
   * @param {VectorProps} props - Initial vector data
   */
  public constructor(props: VectorProps) {
    this.x = props.x;
    this.y = props.y;
  }

  /**
   * Returns the current x coordinate
   *
   * @returns The x value
   */
  public getX(): number {
    return this.x;
  }

  /**
   * Returns the current y coordinate
   *
   * @returns The y value
   */
  public getY(): number {
    return this.y;
  }

  /**
   * Returns the x and y coordinates as an object
   *
   * @returns An object with {x:?, y:?}
   */
  public get(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Sets the x coordinate
   * @param x The new x value
   */
  public setX(x: number): void {
    this.x = x;
  }

  /**
   * Sets the y coordinate
   *
   * @param x The new y value
   */
  public setY(y: number): void {
    this.y = y;
  }

  /**
   * Sets the x and y coordinate
   *
   * @param x The new x value
   * @param y The new y value
   */
  public set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns the length of the vector squared
   *
   * @returns The length of the vector squared
   */
  public lengthSqrt(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Returns the length of the vector
   *
   * @returns The length of the vector
   */
  public length(): number {
    return Math.sqrt(this.lengthSqrt());
  }

  /**
   * Calculates the distance to another vector
   *
   * @param vec The other vector
   * @returns The distance to the other vector
   */
  public distance(vec: Vector): number {
    const dist = new Vector({ x: this.getX() - vec.getX(), y: this.getY() - vec.getY() });
    return dist.length();
  }
}

export { Vector };
