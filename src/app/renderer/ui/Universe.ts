import { Circle } from '../utils/quadtree/Circle';
import { Quadtree } from '../utils/quadtree/Quadtree';
import { Planet } from '../models/Planet';
import { CameraController } from '../controller/CameraController';
import { Vector } from '../models/Vector';

// TODO: TESTS

/**
 * This class represents the universe map. <br>
 * It is responsible for rendering.
 */
class Universe {
  /**
   * The canvas html element
   */
  private canvas: HTMLCanvasElement;
  /**
   * The context of the html element
   */
  private context: CanvasRenderingContext2D;
  /**
   * The array which contains all planets
   */
  private planets: Planet[];
  /**
   * The search tree (quadtree) to get all close planets to a specific point (Faster lookup)
   */
  private tree: Quadtree<Planet | Circle>;

  /**
   * Holds the current hovered planet
   */
  private hoveredPlanet: Planet | null;
  /**
   * The current zoom amount <br>
   * A bigger number means we are closer to the surface
   */
  private zoom = 2;
  /**
   * The current offset of the camera to the default
   */
  private cameraOffset = new Vector(1, 1);
  /**
   * The camera
   */
  private cameraController: CameraController;

  /**
   * Creates a new universe
   *
   * @param canvas The canvas html element to render on
   */
  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
  }

  /**
   * Setup the universe and start the rendering
   */
  public init(cameraController: CameraController): void {
    this.cameraController = cameraController;

    // Init quadtree
    this.tree = new Quadtree({
      height: 5000,
      width: 5000,
      maxObjects: 4,
    });

    this.getPlanets().then(() => {
      this.draw();
      /*
      // TODO: Tests (REMOVE HERE)
      this.routeManager.addTargetPlanet(
        this.planets.find((planet) => planet.getName() == 'Terra')
      );
      this.routeManager.addTargetPlanet(
        this.planets.find((planet) => planet.getName() == 'Main Street')
      );
      this.routeManager.calculateRoute(30);
      console.log(this.routeManager.getRoute());
      */
    });

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.zoom = 1;
    this.cameraOffset.set(window.innerWidth / 2, window.innerHeight / 2);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Retrieves all planets from the backend database and stores them in the local array
   */
  private getPlanets = async () => {
    this.planets = [];
    const planetAffiliationData = await window.sql.planets();
    planetAffiliationData.forEach((element) => {
      const planet = new Planet(element);
      this.planets.push(planet);
      this.tree.insert(planet);
    });
  };

  /**
   * The render function
   */
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
      if (
        this.cameraController.getSelectedPlanet() &&
        this.cameraController.getSelectedPlanet() === planet
      )
        return;
      // Render all planets
      this.drawPlanet(planet, 4);
    });

    if (this.cameraController.getSelectedPlanet()) {
      // Draw the selected planets in the foreground
      this.drawPlanet(this.cameraController.getSelectedPlanet(), 7, '#07d9c7');
      this.drawPlanet(this.cameraController.getSelectedPlanet(), 4);
    }

    // FIXME: Use events instead!
    if (this.cameraController.getRouteManager().getRoute().length > 0) {
      this.context.strokeStyle = 'rgba(255, 255, 255, 1)';
      this.context.lineWidth = 1;
      const route = this.cameraController.getRouteManager().getRoute();
      for (let i = 0; i < route.length - 1; i++) {
        this.context.beginPath();
        this.context.moveTo(route[i].coord.getX(), route[i].coord.getY());
        this.context.lineTo(
          route[i + 1].coord.getX(),
          route[i + 1].coord.getY()
        );
        this.context.stroke();
        this.context.closePath();
      }
    }

    if (this.zoom > 2) {
      // Render only at a Zoom of 2 or bigger
      if (this.hoveredPlanet) {
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

    if (this.zoom > 3) {
      this.planets.forEach((planet: Planet) => {
        // Render all planet texts
        this.drawPlanetName(planet);
      });
    }

    // Request a rerender
    requestAnimationFrame(this.draw.bind(this));
  }

  /**
   * Helper function to draw a planet on the canvas
   *
   * @param planet The planet to draw
   * @param size The size of the planet
   * @param color (Optional) A color to override the planet color
   */
  private drawPlanet(planet: Planet, size: number, color?: string) {
    this.context.beginPath();
    this.context.arc(
      planet.coord.getX(),
      planet.coord.getY(),
      size / this.zoom,
      0,
      Math.PI * 2
    );
    this.context.fillStyle = color || planet.getColor();
    this.context.fill();
    this.context.closePath();
  }

  /**
   * Helper function to draw the planet name on the canvas
   *
   * @param planet The planet for which the planet name should be drawn
   */
  private drawPlanetName(planet: Planet) {
    this.context.font = '3px serif';
    this.context.fillStyle = '#D5D5D5';
    this.context.fillText(
      planet.getName(),
      planet.coord.getX() + 2,
      planet.coord.getY()
    );
  }

  /**
   * Set the zoom factor
   *
   * @param zoom The zoom amount
   */
  public setZoom(zoom: number) {
    this.zoom = zoom;
  }

  /**
   * Sets the offset for the camera
   *
   * @param offset The new offset
   */
  public setCameraOffset(offset: Vector) {
    this.cameraOffset = offset;
  }

  /**
   * To get the current zoom factor
   *
   * @returns The current zoom
   */
  public getZoom(): number {
    return this.zoom;
  }

  /**
   * To get the current offset of the camera
   *
   * @returns The current offset as an vector
   */
  public getCameraOffset(): Vector {
    return this.cameraOffset;
  }

  /**
   * To get the x and y coordinate on the canvas of a specific point on the screen (e.g. mouse position)
   *
   * @param vec The current position on the screen
   * @returns The converted x and y coordinates on the canvas
   */
  public getXY(vec: Vector): Vector {
    const point = new DOMPoint(vec.getX(), vec.getY());
    const matrix = this.context.getTransform();
    const inverse = matrix.invertSelf();
    return new Vector(
      point.matrixTransform(inverse).x,
      point.matrixTransform(inverse).y
    );
  }

  /**
   * To get all planets which are in range on the specified vector
   *
   * @param coord The coordinate from where to check (canvas space)
   * @param range The range in pixels (1px = 1 Lightyear)
   * @returns A list of planets
   */
  public getAllInRange(coord: Vector, range: number): Planet[] {
    const planets = this.tree.retrieve(
      new Circle({ x: coord.getX(), y: coord.getY(), r: range })
    ) as Planet[];
    return planets;
  }

  /**
   * To get the closest planet to a specific vector and its distance
   *
   * @param coord The coordinate from where to check (canvas space)
   * @param range The range in pixels (1px = 1 Lightyear)
   * @returns The closest planet and its distance in an object
   */
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

  /**
   * To highlight an planet by e.g. hovering
   *
   * @param planet The planet to highlight
   */
  public highlightPlanet(planet: Planet | null): void {
    this.hoveredPlanet = planet;
  }

  /**
   * Get a planet object by its name.
   *
   * @param planetName The name of the planet to find
   * @returns The planet object or null
   */
  public getGetPlanetByName(planetName: string): Planet {
    return this.planets.find((planet) => planet.getName() === planetName);
  }
}

export { Universe };
