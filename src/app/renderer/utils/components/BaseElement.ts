abstract class BaseElement {
  protected readonly parentElement: HTMLElement;

  public constructor(parentElement: HTMLElement) {
    this.parentElement = parentElement;
  }

  public abstract render(): this;
  public abstract remove(): void;
}

export { BaseElement };
