import { Vector } from '../models/Vector';
import { Universe } from '../ui/Universe';
import { Planet } from '../models/Planet';
import { RouteController } from './RouteController';

// TODO: COMMENT, TESTS

class CameraController {
  readonly MAX_ZOOM = 5;
  readonly MIN_ZOOM = 0.7;
  readonly SCROLL_SENSITIVITY = 0.0005;

  private element: HTMLCanvasElement;
  private universe: Universe;

  private isMoved = false;
  private isClicked = false;
  private dragStart = new Vector(0, 0);

  private ctrlPressed: boolean;

  /**
   * The route planing manager
   */
  private routeManager: RouteController;

  public constructor() {}

  public init(universe: Universe, routeController: RouteController) {
    this.universe = universe;
    this.element = this.universe.getCanvas();
    this.routeManager = routeController;

    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this)); // detect on the whole window to prevent release but if moving cursor out of canvas
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('wheel', this.handleMouseWheel.bind(this));
    this.element.addEventListener('click', this.handleClick.bind(this));
    // TODO: Move to extra controller?
    this.element.addEventListener('keydown', this.handleKeyPress.bind(this));
    this.element.addEventListener('keyup', this.handleKeyPress.bind(this));
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

  /**
   * Get the clicked canvas coordinate and check if a planet got clicked. If yes, select this planet and invoke the event. If not reset the clicked plant and invoke the event<br>
   * Also handles to calculate the distance to a second planet clicked, if a planet got selected and ctrl is pressed.
   *
   * @param e The mouse event
   */
  private handleClick(e: MouseEvent) {
    if (this.isMoved) return;
    const clicked = this.universe.getXY(new Vector(e.clientX, e.clientY));

    const closest = this.universe.getClosestPlanet(clicked, 5);

    if (closest !== undefined && closest.dist < 4) {
      if (
        this.ctrlPressed &&
        this.universe.getSelectedPlanet() !== null &&
        this.universe.getSelectedPlanet() !== closest.planet
      ) {
        // Display distance to other planet
        this.universe.setDistanceToPlanet(closest.planet);
      } else {
        this.universe.setSelectedPlanet(closest.planet);
        console.log(closest.planet);
      }
    } else {
      // Reset the selected planet. If ctrl is pressed reset the distance planet. if not reset the selected planet.
      // Resetting the selected planet also resets the distance planet
      if (this.ctrlPressed) {
        this.universe.setDistanceToPlanet(null);
      } else {
        this.universe.setSelectedPlanet(null);
      }
    }
  }

  private handleKeyPress(evt: KeyboardEvent) {
    if (evt.type === 'keydown') {
      if (evt.key === 'f') {
        if (this.universe.getSelectedPlanet() !== null) {
          this.routeManager.addTargetPlanet(this.universe.getSelectedPlanet());
        }
      } else if (evt.key === 'Control') {
        this.ctrlPressed = true;
      }
    } else if (evt.type === 'keyup') {
      if (evt.key === 'Control') {
        this.ctrlPressed = false;
      }
    }
  }

  public centerOnPlanetByName(planetName: string) {
    const planet = this.universe.getGetPlanetByName(planetName);
    this.centerOnPlanet(planet);
  }

  public centerOnPlanet(planet: Planet) {
    this.universe.setCameraOffset(
      new Vector(-planet.coord.getX(), planet.coord.getY())
    );
  }

  public centerOnPlanetAndSelect(planet: Planet) {
    this.centerOnPlanet(planet);
    // TODO: Create private func
    this.universe.setSelectedPlanet(planet);
  }

  public getRouteManager() {
    return this.routeManager;
  }
}

export { CameraController };
