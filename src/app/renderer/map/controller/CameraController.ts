import { Vector, VectorProps } from '@renderer/models/Vector';
import UniverseController from '@renderer/map/controller/UniverseController';
import { EventHandler } from '@renderer/handler/EventHandler';
import { RouteController } from './RouteController';
import { UpdateRouteEvent } from '@renderer/handler/events/UpdateRouteVent';

export type CameraControllerProps = {
  cameraZoom: number;
  cameraOffset: VectorProps;
  universeController: UniverseController;
};

class CameraController {
  readonly MAX_ZOOM = 5;
  readonly MIN_ZOOM = 0.7;
  readonly SCROLL_SENSITIVITY = 0.0005;

  private universe: UniverseController;

  public updateRouteEvent: EventHandler<UpdateRouteEvent>;

  private isMoved = false;
  private isClicked = false;
  private dragStart: VectorProps = { x: 0, y: 0 };

  private ctrlPressed: boolean = false;

  /**
   * The zoom level of the canvas
   *
   * A bigger number means we are closer to the surface
   */
  private cameraZoom: number;
  /**
   * The offset in the canvas
   */
  private cameraOffset: VectorProps;

  /**
   * The route planing manager
   */
  private routeManager!: RouteController;

  /**
   *
   * @param {CameraControllerProps} props - The camera controller properties
   */
  public constructor(props: CameraControllerProps) {
    const { cameraOffset, cameraZoom, universeController } = props;
    this.cameraZoom = cameraZoom;
    this.cameraOffset = cameraOffset;
    this.updateRouteEvent = new EventHandler();
    this.universe = universeController;
  }

  public appendEventHandlers(canvasElement: HTMLCanvasElement): void {
    canvasElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
    canvasElement.addEventListener('mouseup', this.handleMouseUp.bind(this));
    canvasElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvasElement.addEventListener('wheel', this.handleMouseWheel.bind(this));
    canvasElement.addEventListener('click', this.handleClick.bind(this));

    canvasElement.addEventListener('keydown', this.handleKeyPress.bind(this));
    canvasElement.addEventListener('keyup', this.handleKeyPress.bind(this));
  }

  public removeEventHandlers(canvasElement: HTMLCanvasElement): void {
    canvasElement.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    canvasElement.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    canvasElement.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    canvasElement.removeEventListener('wheel', this.handleMouseWheel.bind(this));
    canvasElement.removeEventListener('click', this.handleClick.bind(this));

    canvasElement.removeEventListener('keydown', this.handleKeyPress.bind(this));
    canvasElement.removeEventListener('keyup', this.handleKeyPress.bind(this));
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isClicked = true;
    this.isMoved = false;
    this.dragStart.x = e.clientX / this.cameraZoom - this.cameraOffset.x;
    this.dragStart.y = e.clientY / this.cameraZoom - this.cameraOffset.y;
  }

  private handleMouseUp(): void {
    this.isClicked = false;
  }

  private handleMouseMove(e: MouseEvent): void {
    this.isMoved = true;
    if (this.isClicked) {
      const x = e.clientX / this.cameraZoom - this.dragStart.x;
      const y = e.clientY / this.cameraZoom - this.dragStart.y;
      this.cameraOffset = { x, y };
    } else {
      // Mouse move but not dragging -> handle
      const pos = this.universe.getXY(new Vector({ x: e.clientX, y: e.clientY }));
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
    let newZoom = this.cameraZoom - zoomAmount;

    newZoom = Math.min(newZoom, this.MAX_ZOOM);
    newZoom = Math.max(newZoom, this.MIN_ZOOM);
    this.cameraZoom = newZoom;
  }

  /**
   * Get the clicked canvas coordinate and check if a planet got clicked. If yes, select this planet and invoke the event. If not reset the clicked plant and invoke the event<br>
   * Also handles to calculate the distance to a second planet clicked, if a planet got selected and ctrl is pressed.
   *
   * @param e The mouse event
   */
  private handleClick(e: MouseEvent): void {
    if (this.isMoved) return;
    const clicked = this.universe.getXY(new Vector({ x: e.clientX, y: e.clientY }));
    console.log(`Clicked at world coordinates (X: ${clicked.getX()}, Y: ${clicked.getY()})`);
    const closest = this.universe.getClosestPlanet(clicked, 5);

    if (closest !== undefined && closest.planet !== null && closest.dist < 4) {
      if (this.ctrlPressed) {
        this.universe.addSelectedPlanet(closest.planet);
      } else {
        this.universe.setSelectedPlanet(closest.planet);
      }
    } else {
      this.universe.clearSelectedPlanets();
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

  public setCameraOffset(props: Partial<VectorProps>): void {
    this.cameraOffset.x = props.x ?? this.cameraOffset.x;
    this.cameraOffset.y = props.y ?? this.cameraOffset.y;
  }

  public getCameraOffset(): VectorProps {
    return this.cameraOffset;
  }

  public setCameraZoom(cameraZoom: number): void {
    this.cameraZoom = cameraZoom;
  }

  public getCameraZoom(): number {
    return this.cameraZoom;
  }
}

export { CameraController };
