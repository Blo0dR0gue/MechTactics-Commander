// TODO: COMMENT, TESTS
class Vector {
  private x: number;
  private y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public get(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public setX(x: number) {
    this.x = x;
  }

  public setY(y: number) {
    this.y = y;
  }

  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public lengthSqrt(): number {
    return this.x * this.x + this.y * this.y;
  }

  public length(): number {
    return Math.sqrt(this.lengthSqrt());
  }

  public distance(vec: Vector): number {
    const dist = new Vector(this.getX() - vec.getX(), this.getY() - vec.getY());
    return dist.length();
  }
}

export { Vector };
