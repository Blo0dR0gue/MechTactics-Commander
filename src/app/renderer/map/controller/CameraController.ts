import { Vector } from '@renderer/models/Vector';
import { Universe } from '@renderer/ui/Universe';
import { Planet } from '@renderer/models/Planet';
import { EventHandler } from '@renderer/handler/EventHandler';
import { RouteController } from './RouteController';
import { UpdateRouteEvent } from '@renderer/handler/events/UpdateRouteVent';

// TODO: COMMENT, TESTS

class CameraController {
  readonly MAX_ZOOM = 5;
  readonly MIN_ZOOM = 0.7;
  readonly SCROLL_SENSITIVITY = 0.0005;

  private element!: HTMLCanvasElement;
  private universe!: Universe;

  public updateRouteEvent: EventHandler<UpdateRouteEvent>;

  private isMoved = false;
  private isClicked = false;
  private dragStart = new Vector(0, 0);

  private ctrlPressed: boolean = false;

  /**
   * The route planing manager
   */
  private routeManager!: RouteController;

  public constructor() {
    this.updateRouteEvent = new EventHandler();
  }

  public init(universe: Universe, routeController: RouteController): void {
    this.universe = universe;
    this.element = this.universe.getCanvas();
    this.routeManager = routeController;

    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('wheel', this.handleMouseWheel.bind(this));
    this.element.addEventListener('click', this.handleClick.bind(this));
    // TODO: Move to extra controller?
    this.element.addEventListener('keydown', this.handleKeyPress.bind(this));
    this.element.addEventListener('keyup', this.handleKeyPress.bind(this));
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isClicked = true;
    this.isMoved = false;
    this.dragStart.setX(e.clientX / this.universe.getZoom() - this.universe.getCameraOffset().getX());
    this.dragStart.setY(e.clientY / this.universe.getZoom() - this.universe.getCameraOffset().getY());
  }

  private handleMouseUp(): void {
    this.isClicked = false;
  }

  private handleMouseMove(e: MouseEvent): void {
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
  private handleMouseWheel(e: WheelEvent): void {
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
  private handleClick(e: MouseEvent): void {
    if (this.isMoved) return;
    const clicked = this.universe.getXY(new Vector(e.clientX, e.clientY));
    console.log(`Clicked at world coordinates (X: ${clicked.getX()}, Y: ${clicked.getY()})`);
    const closest = this.universe.getClosestPlanet(clicked, 5);

    if (closest !== undefined && closest.planet !== null && closest.dist < 4) {
      if (this.ctrlPressed && this.universe.getSelectedPlanet() !== null && this.universe.getSelectedPlanet() !== closest.planet) {
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

  private handleKeyPress(evt: KeyboardEvent): void {
    if (evt.type === 'keydown') {
      if (evt.key === 'f') {
        const selectedPlanet = this.universe.getSelectedPlanet();
        if (selectedPlanet !== null && !this.routeManager.containsPlanet(selectedPlanet)) {
          this.routeManager.addTargetPlanet(selectedPlanet);
          this.updateRouteEvent.invoke({
            planet: selectedPlanet,
            add: true,
            numberPlanets: this.routeManager.lengthOfTargetPlanets()
          });
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

  public centerOnPlanetByName(planetName: string): void {
    const planet = this.universe.getGetPlanetByName(planetName);
    if (planet) {
      this.centerOnPlanet(planet);
    }
  }

  public centerOnPlanet(planet: Planet): void {
    this.universe.setCameraOffset(new Vector(window.innerWidth / 2 - planet.coord.getX(), window.innerHeight / 2 - planet.coord.getY()));
  }

  public centerOnPlanetAndSelect(planet: Planet): void {
    this.universe.setCameraOffset(new Vector(window.innerWidth / 2 - planet.coord.getX(), window.innerHeight / 2 - planet.coord.getY()));
    // TODO: Create private func
    this.universe.setSelectedPlanet(planet);
  }

  public getRouteManager(): RouteController {
    return this.routeManager;
  }
}

export { CameraController };
