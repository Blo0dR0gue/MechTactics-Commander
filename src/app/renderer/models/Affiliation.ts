class Affiliation {
  private id: number;
  private name: string;
  private color: string;

  public constructor(id: number, name: string, color: string) {
    this.id = id;
    this.name = name;
    this.color = color;
  }

  public getID(): number {
    return this.id;
  }

  public getColor() {
    return this.color;
  }

  public getName() {
    return this.name;
  }
}

export { Affiliation };
