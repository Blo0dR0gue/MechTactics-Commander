import { Planet } from './Planet';
import { Quadtree } from '../utils/quadtree/Quadtree';
import { Circle } from '../utils/quadtree/Circle';
import { CameraController } from './CameraController';
import { Vector } from '../utils/Vector';

class Universe {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private planets: Planet[];
  private tree: Quadtree<Planet | Circle>;

  private zoom = 2;
  private cameraOffset = new Vector(1, 1);
  private cameraController: CameraController;

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
    this.cameraOffset.set(window.innerWidth / 2, -window.innerHeight * 0.5);
    this.cameraController = new CameraController(this.canvas, this);
    this.cameraController.init();
  }

  private getPlanets = async () => {
    this.planets = [];
    const planetAffiliationData = await window.sql.planets();
    planetAffiliationData.forEach((element) => {
      this.planets.push(new Planet(element));
    });
  };

  private draw() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    this.context.translate(window.innerWidth / 2, window.innerHeight / 2);
    this.context.scale(this.zoom, -this.zoom);
    this.context.translate(
      -window.innerWidth / 2 + this.cameraOffset.getX(),
      -window.innerHeight / 2 - this.cameraOffset.getY()
    );
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.planets.forEach((planet: Planet) => {
      this.context.beginPath();
      this.context.arc(
        planet.coord.getX(),
        planet.coord.getY(),
        4 / this.zoom,
        0,
        Math.PI * 2
      );
      this.context.fillStyle = planet.getColor();
      this.context.fill();
      this.context.closePath();
    });

    requestAnimationFrame(this.draw.bind(this));
  }

  public setZoom(zoom: number) {
    this.zoom = zoom;
  }

  public setCameraOffset(offset: Vector) {
    this.cameraOffset = offset;
  }

  public getZoom(): number {
    return this.zoom;
  }

  public getCameraOffset(): Vector {
    return this.cameraOffset;
  }
}

export { Universe };
