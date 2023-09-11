import { Planet } from './Planet';
import { Quadtree } from '../utils/quadtree/Quadtree';
import { Circle } from '../utils/quadtree/Circle';
import { MouseController } from './MouseController';

class Universe {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private planets: Planet[];
  private tree: Quadtree<Planet | Circle>;

  private zoom = 2;
  private cameraOffset: Coord = { x: 1, y: 1 };
  private mouseController: MouseController;

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

    this.getPlanets().then(() => {
      this.draw();
    });

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.zoom = 1;
    this.cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.mouseController = new MouseController(this.canvas, this);
    this.mouseController.init();
  }

  private getPlanets = async () => {
    this.planets = await window.sql.planets();
  };

  private draw() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    this.context.translate(window.innerWidth / 2, window.innerHeight / 2);
    this.context.scale(this.zoom, this.zoom);
    this.context.translate(
      -window.innerWidth / 2 + this.cameraOffset.x,
      -window.innerHeight / 2 + this.cameraOffset.y
    );
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.planets.forEach((planet: Planet) => {
      this.context.beginPath();
      this.context.arc(planet.x, planet.y, 4, 0, Math.PI * 2);
      this.context.fillStyle = 'blue';
      this.context.fill();
      this.context.closePath();
    });

    requestAnimationFrame(this.draw.bind(this));
  }

  public setZoom(zoom: number) {
    this.zoom = zoom;
  }

  public setCameraOffset(offset: Coord) {
    this.cameraOffset = offset;
  }

  public getZoom(): number {
    return this.zoom;
  }

  public getCameraOffset(): Coord {
    return this.cameraOffset;
  }
}

interface Coord {
  x: number;
  y: number;
}

export { Universe, Coord };
