import { Planet } from '../objects/Planet';
import { Quadtree } from '../../utils/quadtree/Quadtree';
import { Circle } from '../../utils/quadtree/Circle';
import { CameraController } from '../player/CameraController';
import { Vector } from './Vector';

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
      const planet = new Planet(element);
      this.planets.push(planet);
      this.tree.insert(planet);
    });
  };

  private draw() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    this.context.translate(window.innerWidth / 2, window.innerHeight / 2);
    this.context.scale(this.zoom, -this.zoom); // invert y so we get the correct battletech map.
    this.context.translate(
      -window.innerWidth / 2 + this.cameraOffset.getX(),
      -window.innerHeight / 2 - this.cameraOffset.getY() // because of the invert we need to subtract here.
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

  public getXY(vec: Vector): Vector {
    const point = new DOMPoint(vec.getX(), vec.getY());
    const matrix = this.context.getTransform();
    const inverse = matrix.invertSelf();
    return new Vector(
      point.matrixTransform(inverse).x,
      point.matrixTransform(inverse).y
    );
  }

  public getClosestPlanet(vec: Vector): Planet | null {
    const planets = this.tree.retrieve(
      new Circle({ x: vec.getX(), y: vec.getY(), r: 5 })
    );
    let closest: Planet;
    let closestDist: number = Infinity;
    for (const planet of planets) {
      const dist = vec.distance(planet.coord);
      if (dist < closestDist) {
        closestDist = dist;
        closest = planet as Planet;
      }
    }
    console.log(planets);
    return closest;
  }
}

export { Universe };
