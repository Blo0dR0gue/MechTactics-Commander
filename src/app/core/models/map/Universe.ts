import { Planet } from '../objects/Planet';
import { Quadtree } from '../../utils/quadtree/Quadtree';
import { Circle } from '../../utils/quadtree/Circle';
import { CameraController } from '../player/CameraController';
import { Vector } from './Vector';

// TODO: COMMENT, TESTS

class Universe {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private planets: Planet[];
  private tree: Quadtree<Planet | Circle>;
  private hoveredPlanet: Planet | null;

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
    this.cameraOffset.set(window.innerWidth / 3, window.innerHeight * 0.5);
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
    // Prepare canvas
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    this.context.translate(window.innerWidth / 2, window.innerHeight / 2);
    this.context.scale(this.zoom, this.zoom);
    this.context.translate(
      -window.innerWidth / 2 + this.cameraOffset.getX(),
      -window.innerHeight / 2 + this.cameraOffset.getY()
    );
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.planets.forEach((planet: Planet) => {
      // Render all planets
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

    if (this.zoom > 2) {
      // Render only at a Zoom of 2 or bigger
      if (this.hoveredPlanet !== undefined) {
        // Highlight the jump range of 30
        // TODO: Allow to change range in settings to 60
        this.context.beginPath();
        this.context.arc(
          this.hoveredPlanet.coord.getX(),
          this.hoveredPlanet.coord.getY(),
          30, // Jump Range
          0,
          Math.PI * 2
        );
        this.context.lineWidth = 0.4;
        this.context.strokeStyle = 'white';
        this.context.stroke();
      }
    }

    // Request a rerender
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

  public getAllInRange(coord: Vector, range: number): Planet[] {
    const planets = this.tree.retrieve(
      new Circle({ x: coord.getX(), y: coord.getY(), r: range })
    ) as Planet[];
    return planets;
  }

  public getClosestPlanet(
    coord: Vector,
    range: number
  ): { planet: Planet; dist: number } | null {
    const planets = this.getAllInRange(coord, range);
    let closest: Planet;
    let closestDist: number = Infinity;
    for (const planet of planets) {
      const dist = coord.distance(planet.coord);
      if (dist < closestDist) {
        closestDist = dist;
        closest = planet as Planet;
      }
    }
    return { planet: closest, dist: closestDist };
  }

  public highlightPlanet(planet: Planet | null): void {
    this.hoveredPlanet = planet;
  }
}

export { Universe };
