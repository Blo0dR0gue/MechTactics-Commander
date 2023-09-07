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
      maxObjects: 3,
      x: 2500,
      y: 2500,
    });

    this.tree.insert(new Planet(-5, 10));
    this.tree.insert(new Planet(-5, 9));
    this.tree.insert(new Planet(100, 0));
    this.tree.insert(new Planet(-10, 16));
    this.tree.insert(new Planet(-20, 12));
    function getRandomInRange(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // Generate and insert 100 random planets
    for (let j = 0; j < 5; j++) {
      this.tree.clear();
      let d1;
      for (let i = 0; i < 10000; i++) {
        const randomX = getRandomInRange(-500, 500); // Adjust the range as needed
        const randomY = getRandomInRange(-500, 500); // Adjust the range as needed
        const planet = new Planet(randomX, randomY);
        this.tree.insert(planet);
        d1 = planet;
      }
      console.log(d1);
      console.time();
      console.log(this.tree.retrieve(d1));
      console.timeEnd();
    }

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}

export { Universe };
