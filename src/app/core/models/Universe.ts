import { Planet } from './Planet';
import { Quadtree } from '../utils/quadtree/Quadtree';

class Universe {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private planets: Planet[];
  private tree: Quadtree<Planet>;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
  }

  public init(): void {
    // Init quadtree
    this.tree = new Quadtree({
      height: 5000,
      width: 5000,
      maxObjects: 3,
      x: 2500,
      y: 2500,
    });

    this.tree.insert(new Planet(-5, 10));
    this.tree.insert(new Planet(-5, 9));
    this.tree.insert(new Planet(100, 0));
    this.tree.insert(new Planet(-10, 16));
    this.tree.insert(new Planet(-20, 12));
    this.tree.insert(new Planet(-21, 12));
    console.log(this.tree.retrieve(new Planet(100, 10)));

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}

export { Universe };
