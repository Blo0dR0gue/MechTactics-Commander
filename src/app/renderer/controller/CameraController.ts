import { Vector } from '../models/Vector';
import { Universe } from '../ui/Universe';
import { Planet } from '../models/Planet';
import { EventHandler } from '../handler/EventHandler';
import { SelectionChangeEvent } from '../handler/events/SelectionChangedEvent';
import { RouteController } from './RouteController';
import { UpdateRouteEvent } from '../handler/events/UpdateRouteVent';

// TODO: COMMENT, TESTS

class CameraController {
  readonly MAX_ZOOM = 5;
  readonly MIN_ZOOM = 0.7;
  readonly SCROLL_SENSITIVITY = 0.0005;

  private element: HTMLCanvasElement;
  private universe: Universe;

  public selectionChangeEvent: EventHandler<SelectionChangeEvent>;
  public updateRouteEvent: EventHandler<UpdateRouteEvent>;

  private selectedPlanet: Planet | null = null;

  private isMoved = false;
  private isClicked = false;
  private dragStart = new Vector(0, 0);

  /**
   * The route planing manager
   */
  private routeManager: RouteController;

  public constructor() {
    this.selectionChangeEvent = new EventHandler();
    this.updateRouteEvent = new EventHandler();
  }

  public init(universe: Universe) {
    this.universe = universe;
    this.element = this.universe.getCanvas();
    this.routeManager = new RouteController(universe);

    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('wheel', this.handleMouseWheel.bind(this));
    this.element.addEventListener('click', this.handleClick.bind(this));
    // TODO: Move to extra controller?
    window.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  private handleMouseDown(e: MouseEvent) {
    this.isClicked = true;
    this.isMoved = false;
    this.dragStart.setX(
      e.clientX / this.universe.getZoom() -
        this.universe.getCameraOffset().getX()
    );
    this.dragStart.setY(
      e.clientY / this.universe.getZoom() -
        this.universe.getCameraOffset().getY()
    );
  }

  private handleMouseUp() {
    this.isClicked = false;
  }

  private handleMouseMove(e: MouseEvent) {
    this.isMoved = true;
    if (this.isClicked) {
      const x = e.clientX / this.universe.getZoom() - this.dragStart.getX();
      const y = e.clientY / this.universe.getZoom() - this.dragStart.getY();
      this.universe.setCameraOffset(new Vector(x, y));
    } else {
      // Mouse move but not dragging -> handle
      const pos = this.universe.getXY(new Vector(e.clientX, e.clientY));
      const closest = this.universe.getClosestPlanet(pos, 5);
      if (closest !== undefined && closest.dist < 4) {
        this.universe.highlightPlanet(closest.planet);
      } else {
        this.universe.highlightPlanet(null);
      }
    }
  }
  private handleMouseWheel(e: WheelEvent) {
    if (this.isClicked) return;
    const zoomAmount = e.deltaY * this.SCROLL_SENSITIVITY;
    let newZoom = this.universe.getZoom() - zoomAmount;

    newZoom = Math.min(newZoom, this.MAX_ZOOM);
    newZoom = Math.max(newZoom, this.MIN_ZOOM);
    this.universe.setZoom(newZoom);
  }

  private handleClick(e: MouseEvent) {
    if (this.isMoved) return;
    const clicked = this.universe.getXY(new Vector(e.clientX, e.clientY));
    console.log(
      `Clicked at world coordinates (X: ${clicked.getX()}, Y: ${clicked.getY()})`
    );
    const closest = this.universe.getClosestPlanet(clicked, 5);
    if (closest !== undefined && closest.dist < 4) {
      this.selectedPlanet = closest.planet;
      console.log(this.selectedPlanet);
    } else {
      this.selectedPlanet = null;
    }
    this.selectionChangeEvent.invoke({ planet: this.selectedPlanet });
  }

  private handleKeyPress(evt: KeyboardEvent) {
    if (evt.key === 'f') {
      if (
        this.selectedPlanet !== null &&
        !this.routeManager.containsPlanet(this.selectedPlanet)
      ) {
        this.routeManager.addTargetPlanet(this.selectedPlanet);
        this.updateRouteEvent.invoke({
          planet: this.selectedPlanet,
          add: true,
          numberPlanets: this.routeManager.lengthOfTargetPlanets(),
        });
        // TODO: Rework (use toast)
        alert(`Added ${this.selectedPlanet.getName()} to the route!`);
      }
    }
  }

  public centerOnPlanetByName(planetName: string) {
    const planet = this.universe.getGetPlanetByName(planetName);
    this.centerOnPlanet(planet);
  }

  public centerOnPlanet(planet: Planet) {
    this.universe.setCameraOffset(
      new Vector(
        window.innerWidth / 2 - planet.coord.getX(),
        window.innerHeight / 2 - planet.coord.getY()
      )
    );
  }

  public getSelectedPlanet(): Planet | null {
    return this.selectedPlanet;
  }

  public getRouteManager() {
    return this.routeManager;
  }
}

export { CameraController };
