import { Circle } from '@renderer/utils/quadtree/Circle';
import { Quadtree } from '@renderer/utils/quadtree/Quadtree';
import { Planet } from '@renderer/models/Planet';
import { Vector, VectorProps } from '@renderer/models/Vector';
import { Config } from '@renderer/utils/Config';
import { Affiliation } from '@renderer/models/Affiliation';
import { RouteController } from '@renderer/map/controller/RouteController';
import { CameraController } from './CameraController';

export type UniverseControllerProps = {
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  onSelectedPlanetsChange: () => void;
};

/**
 * This class represents the universe map. <br>
 * It is responsible for rendering.
 */
export default class UniverseController {
  /**
   * The context of the html element
   */
  private context: CanvasRenderingContext2D;

  /**
   * The array which contains all planets
   */
  private planets: Planet[] = [];

  /**
   * The array which contains all affiliations
   */
  private affiliations: Affiliation[] = [];

  /**
   * The search tree (quadtree) to get all close planets to a specific point (Faster lookup)
   */
  private tree!: Quadtree<Planet | Circle>;

  /**
   * The controller for the viewport. Handles mouse and keyboard events.
   */
  private cameraController: CameraController;

  /**
   * The route controller
   */
  private routeController!: RouteController;

  /**
   * The currently selected planet which gets highlighted
   */
  private selectedPlanets: Planet[];

  /**
   * Holds the current hovered planet
   */
  private hoveredPlanet: Planet | null;

  /**
   * The active universe age
   */
  private selectedUniverseAge!: number;

  /**
   * List of available universe ages
   */
  private universeAges: Set<number>;

  /**
   * Background color for the app
   */
  private backgroundColor!: string;

  /**
   * The html canvas element
   */
  private canvas: HTMLCanvasElement;

  /**
   * Executed if the selected planets change
   */
  private onSelectedPlanetsChange: () => void;

  private isActive: boolean;

  /**
   * Creates a new universe
   *
   * @param {UniverseControllerProps} props - Props for the controller
   */
  public constructor(props: UniverseControllerProps) {
    this.context = props.canvasCtx;
    this.canvas = props.canvas;

    this.selectedPlanets = [];
    this.hoveredPlanet = null;
    this.onSelectedPlanetsChange = props.onSelectedPlanetsChange;

    // Init quadtree
    this.tree = new Quadtree({
      height: 5000,
      width: 5000,
      maxObjects: 4
    });

    this.cameraController = new CameraController({
      cameraZoom: 2.4,
      cameraOffset: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      universeController: this
    });

    this.isActive = false;

    this.routeController = new RouteController(this);

    this.universeAges = new Set();
    this.initData();
  }

  private getAffiliations = async (): Promise<void> => {
    this.affiliations = [];
    const affiliationJSONData = await window.sql.getAllAffiliations();
    affiliationJSONData.forEach((affiliationJSON) => {
      // Create object and add to affiliations array
      const affiliation = new Affiliation(affiliationJSON.id, affiliationJSON.name, affiliationJSON.color);
      this.affiliations.push(affiliation);
    });
  };

  private getUniverseAges = async (): Promise<void> => {
    this.universeAges = await window.sql.getAllUniverseAges();
    const configAge = Config.getInstance().get('selectedUniverseAge') as number;
    if (this.universeAges.has(configAge)) {
      this.selectedUniverseAge = configAge;
    } else {
      this.setSelectedUniverseAge(this.universeAges[0]);
    }
  };

  private getPlanets = async (age: number = this.selectedUniverseAge): Promise<void> => {
    this.planets = [];
    this.tree.clear();
    this.routeController.clearRoute();
    this.highlightPlanet(null);

    const planetJSONData = await window.sql.getPlanetsAtAge(age);
    planetJSONData.forEach((planetJSON) => {
      // Find the affiliation for this planet
      const planetAffiliation = this.affiliations.find((affiliation) => affiliation.getID() === planetJSON.affiliationID);

      if (planetAffiliation === undefined) {
        console.log(`Affiliation with id=${planetJSON.affiliationID} not found!`);
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
        this.selectedUniverseAge
      );
      this.planets.push(planet);
      this.tree.insert(planet);
    });
  };

  /**
   * Retrieves all planets & affiliations from the backend database and stores them in the corresponding local array
   */
  private initData = async (): Promise<void> => {
    await this.getUniverseAges();
    await this.getAffiliations();
    await this.getPlanets();
  };

  public startRendering(): void {
    this.isActive = true;
    this.render();
    this.cameraController.appendEventHandlers(this.canvas);
  }

  public stopRendering(): void {
    this.isActive = false;
    this.cameraController.removeEventHandlers(this.canvas);
  }

  /**
   * The render function
   */
  private render(): void {
    // Prepare canvas
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    this.context.translate(window.innerWidth / 2, window.innerHeight / 2);
    this.context.scale(this.cameraController.getCameraZoom(), this.cameraController.getCameraZoom());
    this.context.translate(
      -window.innerWidth / 2 + this.cameraController.getCameraOffset().x,
      -window.innerHeight / 2 + this.cameraController.getCameraOffset().y
    );
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.planets.forEach((planet: Planet) => {
      if (this.isPlanetSelected(planet) || this.routeController.routeContainsPlanet(planet)) return;
      // Render all planets
      this.drawPlanet(planet, 4);
    });

    if (this.routeController.getRoute().length > 0) {
      const route = this.routeController.getRoute();
      for (let i = 0; i < route.length - 1; i++) {
        this.drawConnection(route[i].coord, route[i + 1].coord);
      }
      for (let i = 0; i < route.length; i++) {
        if (!this.isPlanetSelected(route[i])) {
          this.drawPlanet(route[i], 7, 'rgb(136, 255, 0)');
          this.drawPlanet(route[i], 4);
        }
      }
    }

    if (this.selectedPlanets.length > 0) {
      // Draw the selected planets in the foreground
      for (let selectedPlanetIndex = 0; selectedPlanetIndex < this.selectedPlanets.length - 1; selectedPlanetIndex++) {
        const planet = this.selectedPlanets[selectedPlanetIndex];
        this.drawPlanet(planet, 7, '#07d9c7');
        this.drawPlanet(planet, 4);

        const nextSelectedPlanet = this.selectedPlanets[selectedPlanetIndex + 1];
        if (nextSelectedPlanet !== undefined) {
          this.drawConnection(planet.coord, nextSelectedPlanet.coord);

          // Draw the distance text
          const distance = planet.coord.distance(nextSelectedPlanet.coord).toFixed(2).toString();
          const textWidth = this.context.measureText(distance).width;
          const textX = (planet.coord.getX() + nextSelectedPlanet.coord.getX() - textWidth) / 2;
          const textY = (planet.coord.getY() + nextSelectedPlanet.coord.getY()) / 2 - 10;
          this.drawText({ x: textX, y: textY }, distance, 20);
        }
        this.drawPlanetName(planet);
      }
    }

    if (this.cameraController.getCameraZoom() > 2) {
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

    if (this.cameraController.getCameraZoom() > 3) {
      this.planets.forEach((planet: Planet) => {
        // Render all planet texts if only one planet is selected
        if (this.selectedPlanets.length <= 1) this.drawPlanetName(planet);
      });
    }

    if (this.isActive) {
      requestAnimationFrame(this.render.bind(this));
    }
  }

  /**
   * Helper function to draw a planet on the canvas
   *
   * @param planet The planet to draw
   * @param size The size of the planet
   * @param color (Optional) A color to override the planet color
   */
  private drawPlanet(planet: Planet, size: number, color?: string): void {
    this.context.beginPath();
    this.context.arc(planet.coord.getX(), planet.coord.getY(), size / this.cameraController.getCameraZoom(), 0, Math.PI * 2);
    this.context.fillStyle = color || planet.getColor();
    this.context.fill();
    this.context.closePath();
  }

  /**
   * Helper function to draw the planet name on the canvas
   *
   * @param planet The planet for which the planet name should be drawn
   */
  private drawPlanetName(planet: Planet): void {
    this.drawText({ x: planet.coord.getX() + 2, y: planet.coord.getY() }, planet.getName(), 14, '#D5D5D5');
  }

  private drawText(pos: VectorProps, text: string, width = 15, textColor = 'rgba(255, 255, 255, 1)'): void {
    const textWidth = Math.round(width / this.cameraController.getCameraZoom());
    this.context.font = `${textWidth}px serif`;
    this.context.fillStyle = textColor;
    this.context.fillText(text, pos.x, pos.y); // Adjust the vertical position as needed
  }

  /**
   * Renders a line between to positions
   *
   * @param posA
   * @param posB
   * @param color (optional)
   */
  private drawConnection(posA: Vector, posB: Vector, color = 'rgba(255, 255, 255, 1)'): void {
    this.context.strokeStyle = color;
    this.context.lineWidth = 3 / this.cameraController.getCameraZoom();
    this.context.beginPath();
    this.context.moveTo(posA.getX(), posA.getY());
    this.context.lineTo(posB.getX(), posB.getY());
    this.context.stroke();
    this.context.closePath();
  }

  /**
   * Set the new selected planet.
   *
   * @param planet - The only selected planet.
   */
  public setSelectedPlanet(planet: Planet): void {
    this.selectedPlanets = [planet];
    this.onSelectedPlanetsChange();
  }

  /**
   * Add one or more planets to the selected list.
   *
   * @param planet - The new planet(s) to select.
   */
  public addSelectedPlanet(planet: Planet | Planet[]): void {
    const planetsToAdd = Array.isArray(planet) ? planet : [planet];
    const uniquePlanets = planetsToAdd.filter((p) => !this.isPlanetSelected(p));
    this.selectedPlanets.push(...uniquePlanets);
    this.onSelectedPlanetsChange();
  }

  /**
   * Remove one or more planets from the selected list.
   *
   * @param planet - The planet(s) to deselect.
   */
  public removeSelectedPlanet(planet: Planet | Planet[]): void {
    const planetsToRemove = Array.isArray(planet) ? planet : [planet];
    this.selectedPlanets = this.selectedPlanets.filter((sp) => !planetsToRemove.some((p) => p.getID() === sp.getID()));
    this.onSelectedPlanetsChange();
  }

  /**
   * Add a planet to the selected list or remove it if already selected.
   *
   * @param planet - The planet to toggle selection for.
   */
  public toggleSelectedPlanet(planet: Planet): void {
    if (this.isPlanetSelected(planet)) {
      this.removeSelectedPlanet(planet);
    } else {
      this.addSelectedPlanet(planet);
    }
  }

  /**
   * Clear all selected planets.
   */
  public clearSelectedPlanets(): void {
    if (this.selectedPlanets.length > 0) {
      this.selectedPlanets = [];
      this.onSelectedPlanetsChange();
    }
  }

  /**
   * Check if a planet is already selected.
   *
   * @param planet - The planet to check.
   * @returns True if the planet is selected, false otherwise.
   */
  private isPlanetSelected(planet: Planet): boolean {
    return this.selectedPlanets.some((sp) => sp.getID() === planet.getID());
  }

  /**
   * Gets the currently selected planets
   *
   * @returns The selected planets
   */
  public getSelectedPlanets(): Planet[] {
    return this.selectedPlanets;
  }

  public getSelectedPlanet(): Planet | null {
    return this.selectedPlanets[0] ?? null;
  }

  /**
   * Gets the current active universe age
   * @returns
   */
  public getSelectedUniverseAge(): number {
    return this.selectedUniverseAge;
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
    return new Vector({ x: point.matrixTransform(inverse).x, y: point.matrixTransform(inverse).y });
  }

  /**
   * To get all planets which are in range on the specified vector
   *
   * @param coord The coordinate from where to check (canvas space)
   * @param range The range in pixels (1px = 1 Lightyear)
   * @returns A list of planets
   */
  public getAllInRange(coord: Vector, range: number): Planet[] {
    const planets = this.tree.retrieve(new Circle({ x: coord.getX(), y: coord.getY(), r: range })) as Planet[];
    return planets;
  }

  /**
   * To get the closest planet to a specific vector and its distance
   *
   * @param coord The coordinate from where to check (canvas space)
   * @param range The range in pixels (1px = 1 Lightyear)
   * @returns The closest planet and its distance in an object
   */
  public getClosestPlanet(coord: Vector, range: number): { planet: Planet | null; dist: number } {
    const planets = this.getAllInRange(coord, range);
    let closest: Planet | null = null;
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
    return this.planets.find((planet) => planet.getName().toLowerCase() === planetName.toLowerCase());
  }

  /**
   * Focus the universe canvas
   */
  public focus(): void {
    this.canvas.focus();
  }

  /**
   * Get a affiliation object by its name
   *
   * @returns The affiliation object or undefined
   */
  public getAffiliationWithName(name: string): Affiliation | undefined {
    return this.affiliations.find((affiliation) => affiliation.getName().toLowerCase() === name.toLowerCase());
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
  public setBackgroundColor(color: string): void {
    this.backgroundColor = color;
    this.canvas.style.backgroundColor = color;
    Config.getInstance().set('backgroundColor', color);
  }

  /**
   * Get the current background color
   * @return
   */
  public getBackgroundColor(): string {
    return this.backgroundColor;
  }

  public centerOnPlanetByName(planetName: string): void {
    const planet = this.getGetPlanetByName(planetName);
    if (planet) {
      this.centerOnPlanet(planet);
    }
  }

  public centerOnPlanet(planet: Planet): void {
    this.cameraController.setCameraOffset({ x: window.innerWidth / 2 - planet.coord.getX(), y: window.innerHeight / 2 - planet.coord.getY() });
  }

  public centerOnPlanetAndSelect(planet: Planet): void {
    this.centerOnPlanet(planet);
    this.setSelectedPlanet(planet);
  }
}
