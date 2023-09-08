import { Planet } from './Planet';
import { Quadtree } from '../utils/quadtree/Quadtree';
import { Circle } from '../utils/quadtree/Circle';

class Universe {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private planets: Planet[];
  private tree: Quadtree<Planet | Circle>;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
  }

  public init(): void {
    // Init quadtree
    this.tree = new Quadtree({
      height: 5000,
      width: 5000,
      maxObjects: 4,
    });

    this.tree.insert(new Planet(2500, 2500));
    this.tree.insert(new Planet(-2500, -2500));
    this.tree.insert(new Planet(2500, -2500));
    this.tree.insert(new Planet(-2500, 2500));
    this.tree.insert(new Planet(0, 0));

    console.log(this.tree.retrieve(new Planet(0, 0)));

    this.getPlanets();

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private getPlanets = async () => {
    const response = await window.sql.planets();

    console.log(response);
  };
}

export { Universe };
