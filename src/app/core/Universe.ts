class Universe {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }

  public init(): void {}
}

export { Universe };
