import { Vector } from '../map/Vector';
import { Universe } from '../map/Universe';
import { Planet } from '../objects/Planet';

// TODO: COMMENT, TESTS

class CameraController {
  readonly MAX_ZOOM = 5;
  readonly MIN_ZOOM = 0.7;
  readonly SCROLL_SENSITIVITY = 0.0005;

  private element: HTMLElement;
  private universe: Universe;

  private selectedPlanet: Planet;

  private isDragging = false;
  private dragStart = new Vector(0, 0);

  public constructor(element: HTMLElement, universe: Universe) {
    this.element = element;
    this.universe = universe;
  }

  public init() {
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('wheel', this.handleMouseWheel.bind(this));
    this.element.addEventListener('click', this.handleClick.bind(this));
  }

  private handleMouseDown(e: MouseEvent) {
    this.isDragging = true;
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
    this.isDragging = false;
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      const x = e.clientX / this.universe.getZoom() - this.dragStart.getX();
      const y = e.clientY / this.universe.getZoom() - this.dragStart.getY();
      this.universe.setCameraOffset(new Vector(x, y));
    }
  }
  private handleMouseWheel(e: WheelEvent) {
    if (this.isDragging) return;
    const zoomAmount = e.deltaY * this.SCROLL_SENSITIVITY;
    let newZoom = this.universe.getZoom() - zoomAmount;

    newZoom = Math.min(newZoom, this.MAX_ZOOM);
    newZoom = Math.max(newZoom, this.MIN_ZOOM);
    this.universe.setZoom(newZoom);
  }

  private handleClick(e: MouseEvent) {
    const clicked = this.universe.getXY(new Vector(e.clientX, e.clientY));
    console.log(
      `Clicked at world coordinates (X: ${clicked.getX()}, Y: ${clicked.getY()})`
    );
    const closest = this.universe.getClosestPlanet(clicked);
    if (closest !== undefined && closest.dist < 2.5) {
      this.selectedPlanet = closest.planet;
      console.log(this.selectedPlanet);
    }
  }
}

export { CameraController };
