import { Circle } from '../utils/quadtree/Circle';
import { Quadtree } from '../utils/quadtree/Quadtree';
import { Planet } from '../models/Planet';
import { Vector } from '../models/Vector';
import { Config } from '../utils/Config';
import { Affiliation } from '../models/Affiliation';
import { RouteController } from '../controller/RouteController';
import { EventHandler } from '../handler/EventHandler';
import { SelectionChangeEvent } from '../handler/events/SelectionChangedEvent';

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
   * The array which contains all affiliations
   */
  private affiliations: Affiliation[];

  /**
   * The search tree (quadtree) to get all close planets to a specific point (Faster lookup)
   */
  private tree: Quadtree<Planet | Circle>;

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
   * The route controller
   */
  private routeController: RouteController;

  /**
   * The currently selected planet which gets highlighted
   */
  private selectedPlanet: Planet | null;

  /**
   * Holds the current hovered planet
   */
  private hoveredPlanet: Planet | null;

  /**
   * Second planet to which the distance should be displayed
   */
  private distancePlanet: Planet | null;

  /**
   * The active universe age
   */
  private selectedUniverseAge: number;

  /**
   * List of available universe ages
   */
  private universeAges: Set<number>;

  /**
   * Background color for the app
   */
  private backgroundColor: string;

  /**
   * Planet selection changed event
   */
  public planetSelectionChangedEvent: EventHandler<SelectionChangeEvent>;

  /**
   * Creates a new universe
   *
   * @param canvas The canvas html element to render on
   */
  public constructor() {
    this.canvas = document.getElementById('universe') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');
    this.universeAges = new Set();

    this.planetSelectionChangedEvent = new EventHandler();
  }

  /**
   * Setup the universe and start the rendering
   */
  public async init(routeController: RouteController): Promise<void> {
    return new Promise((resolve) => {
      this.routeController = routeController;
      this.selectedPlanet = null;
      this.distancePlanet = null;
      this.hoveredPlanet = null;

      // Init quadtree
      this.tree = new Quadtree({
        height: 5000,
        width: 5000,
        maxObjects: 4,
      });

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.zoom = 2.4;
      this.cameraOffset.set(window.innerWidth / 2, window.innerHeight / 2);

      this.setBackgroundColor(
        Config.getInstance().get('backgroundColor') as string
      );

      this.initData().then(() => {
        this.render();
        resolve();
      });
    });
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  private getAffiliations = async () => {
    this.affiliations = [];
    const affiliationJSONData = await window.sql.getAllAffiliations();
    affiliationJSONData.forEach((affiliationJSON) => {
      // Create object and add to affiliations array
      const affiliation = new Affiliation(
        affiliationJSON.id,
        affiliationJSON.name,
        affiliationJSON.color
      );
      this.affiliations.push(affiliation);
    });
  };

  private getUniverseAges = async () => {
    this.universeAges = await window.sql.getAllUniverseAges();
    const configAge = Config.getInstance().get('selectedUniverseAge') as number;
    if (this.universeAges.has(configAge)) {
      this.selectedUniverseAge = configAge;
    } else {
      this.setSelectedUniverseAge(this.universeAges[0]);
    }
  };

  private getPlanets = async (age: number = this.selectedUniverseAge) => {
    this.planets = [];
    this.tree.clear();
    this.routeController.clearRoute();
    this.setSelectedPlanet(null);
    this.highlightPlanet(null);

    const planetJSONData = await window.sql.getPlanetsAtAge(age);
    planetJSONData.forEach((planetJSON) => {
      // Find the affiliation for this planet
      const planetAffiliation = this.affiliations.find(
        (affiliation) => affiliation.getID() === planetJSON.affiliationID
      );

      if (planetAffiliation === undefined) {
        console.log(
          `Affiliation with id=${planetJSON.affiliationID} not found!`
        );
        return; // TODO: Error Handling
      }

      // Create object and add to planets array and quadtree
      const planet = new Planet(
        planetJSON.id,
        planetJSON.name,
        planetJSON.x,
        planetJSON.y,
        planetJSON.link,
        planetJSON.planetText,
        planetAffiliation,
        this.selectedUniverseAge,
        planetJSON.tags,
        planetJSON.fuelingStation ?? false,
        planetJSON.details,
        planetJSON.type
      );
      this.planets.push(planet);
      this.tree.insert(planet);
    });
  };

  /**
   * Retrieves all planets & affiliations from the backend database and stores them in the corresponding local array
   */
  private initData = async () => {
    await this.getUniverseAges();
    await this.getAffiliations();
    await this.getPlanets();
  };

  /**
   * The render function
   */
  private render() {
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
        (this.selectedPlanet && this.selectedPlanet === planet) ||
        (this.distancePlanet && this.distancePlanet === planet) ||
        this.routeController.routeContainsPlanet(planet)
      )
        return;
      // Render all planets
      this.drawPlanet(planet, 4);
    });

    // FIXME: Use events instead!
    if (this.routeController.getRoute().length > 0) {
      const route = this.routeController.getRoute();
      for (let i = 0; i < route.length - 1; i++) {
        this.drawConnection(route[i].coord, route[i + 1].coord);
      }
      for (let i = 0; i < route.length; i++) {
        if (this.selectedPlanet !== route[i]) {
          this.drawPlanet(route[i], 7, 'rgb(136, 255, 0)');
          this.drawPlanet(route[i], 4);
        }
      }
    }

    if (this.selectedPlanet !== null) {
      // Draw the selected planets in the foreground
      this.drawPlanet(this.selectedPlanet, 7, '#07d9c7');
      this.drawPlanet(this.selectedPlanet, 4);
      if (this.distancePlanet !== null) {
        this.drawPlanet(this.distancePlanet, 7, '#ab7b0a');
        this.drawPlanet(this.distancePlanet, 4);
        this.drawConnection(
          this.selectedPlanet.coord,
          this.distancePlanet.coord
        );
        // Draw the distance text
        const distance = this.selectedPlanet.coord
          .distance(this.distancePlanet.coord)
          .toFixed(2)
          .toString();
        const textWidth = this.context.measureText(distance).width;
        const textX =
          (this.selectedPlanet.coord.getX() +
            this.distancePlanet.coord.getX() -
            textWidth) /
          2;
        const textY =
          (this.selectedPlanet.coord.getY() +
            this.distancePlanet.coord.getY()) /
            2 -
          10;
        this.drawText(new Vector(textX, textY), distance, 20);
        this.drawPlanetName(this.selectedPlanet);
        this.drawPlanetName(this.distancePlanet);
      }
    }

    if (this.zoom > 2) {
      // Render only at a Zoom of 2 or bigger
      if (this.hoveredPlanet) {
        // Highlight the jump range of 30
        this.context.beginPath();
        this.context.arc(
          this.hoveredPlanet.coord.getX(),
          this.hoveredPlanet.coord.getY(),
          Config.getInstance().get('jumpRange') as number, // Jump Range
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
        // Render all planet texts if no distancePlanet got selected
        if (this.distancePlanet === null) this.drawPlanetName(planet);
      });
    }

    // Request a rerender
    requestAnimationFrame(this.render.bind(this));
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
    this.drawText(
      new Vector(planet.coord.getX() + 2, planet.coord.getY()),
      planet.getName(),
      14,
      '#D5D5D5'
    );
  }

  private drawText(
    pos: Vector,
    text: string,
    width = 15,
    textColor = 'rgba(255, 255, 255, 1)'
  ) {
    const textWidth = Math.round(width / this.zoom);
    this.context.font = `${textWidth}px serif`;
    this.context.fillStyle = textColor;
    this.context.fillText(text, pos.getX(), pos.getY()); // Adjust the vertical position as needed
  }

  /**
   * Renders a line between to positions
   *
   * @param posA
   * @param posB
   * @param color (optional)
   */
  private drawConnection(
    posA: Vector,
    posB: Vector,
    color = 'rgba(255, 255, 255, 1)'
  ) {
    this.context.strokeStyle = color;
    this.context.lineWidth = 3 / this.zoom;
    this.context.beginPath();
    this.context.moveTo(posA.getX(), posA.getY());
    this.context.lineTo(posB.getX(), posB.getY());
    this.context.stroke();
    this.context.closePath();
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
   * Updates the sleeted planet which gets highlighted.
   * Also resets the distance planet
   *
   * @param planet The new planet to highlight
   */
  public setSelectedPlanet(planet: Planet | null): void {
    this.distancePlanet = null;
    this.selectedPlanet = planet;
    this.planetSelectionChangedEvent.invoke({
      planet: this.selectedPlanet,
    });
  }

  /**
   * Gets the currently selected planet object or null
   *
   * @returns The selected planet or null
   */
  public getSelectedPlanet(): Planet | null {
    return this.selectedPlanet;
  }

  /**
   * Displays the distance from the selected planet to a other selected planet
   *
   * @param planet
   */
  public setDistanceToPlanet(planet: Planet) {
    this.distancePlanet = planet;
  }

  /**
   * Gets the current active universe age
   * @returns
   */
  public getSelectedUniverseAge(): number {
    return this.selectedUniverseAge || -1;
  }

  /**
   * Gets all available universe ages
   * @returns
   */
  public getAvailableUniverseAges(): Set<number> {
    return this.universeAges;
  }

  /**
   * Sets the active universe age, if it is available
   * @param {number} age The new age
   */
  public setSelectedUniverseAge(age: number): void {
    if (this.selectedUniverseAge === age) return;
    if (this.universeAges.has(age)) {
      this.selectedUniverseAge = age;
      this.getPlanets();
      Config.getInstance().set('selectedUniverseAge', age);
    }
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
   * @returns The planet object or undefined
   */
  public getGetPlanetByName(planetName: string): Planet | undefined {
    return this.planets.find(
      (planet) => planet.getName().toLowerCase() === planetName.toLowerCase()
    );
  }

  /**
   * Focus the universe canvas
   */
  public focus() {
    this.canvas.focus();
  }

  /**
   * Get a affiliation object by its name
   *
   * @returns The affiliation object or undefined
   */
  public getAffiliationWithName(name: string): Affiliation | undefined {
    return this.affiliations.find(
      (affiliation) =>
        affiliation.getName().toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Gets all affiliations
   * @returns All available affiliations
   */
  public getAllAffiliations(): Affiliation[] {
    return this.affiliations;
  }

  /**
   * Set the background color of the app
   * @param color
   */
  public setBackgroundColor(color: string) {
    this.backgroundColor = color;
    this.canvas.style.backgroundColor = color;
    Config.getInstance().set('backgroundColor', color);
  }

  /**
   * Get the current background color
   * @return
   */
  public getBackgroundColor() {
    return this.backgroundColor;
  }
}

export { Universe };
