import { Coord, Universe } from './Universe';

class MouseController {
  readonly MAX_ZOOM = 3;
  readonly MIN_ZOOM = 0.7;
  readonly SCROLL_SENSITIVITY = 0.0005;

  private element: HTMLElement;
  private universe: Universe;

  private isDragging = false;
  private dragStart: Coord = { x: 0, y: 0 };

  public constructor(element: HTMLElement, universe: Universe) {
    this.element = element;
    this.universe = universe;
  }

  public init() {
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('wheel', this.handleMouseWheel.bind(this));
  }

  private handleMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.dragStart.x =
      e.clientX / this.universe.getZoom() - this.universe.getCameraOffset().x;
    this.dragStart.y =
      e.clientY / this.universe.getZoom() - this.universe.getCameraOffset().y;
  }

  private handleMouseUp() {
    this.isDragging = false;
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      const x = e.clientX / this.universe.getZoom() - this.dragStart.x;
      const y = e.clientY / this.universe.getZoom() - this.dragStart.y;
      this.universe.setCameraOffset({
        x: x,
        y: y,
      });
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
}

export { MouseController };
