class Affiliation {
  private name: string;
  private color: string;

  public constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }

  public getColor() {
    return this.color;
  }

  public getName() {
    return this.name;
  }
}

export { Affiliation };
