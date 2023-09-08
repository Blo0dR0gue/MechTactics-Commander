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

    this.getPlanets();

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private getPlanets = async () => {
    this.planets = await window.sql.planets();
    console.log(this.planets);
  };
}

export { Universe };
