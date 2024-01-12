abstract class BaseElement {
  public constructor(protected readonly parentElement: HTMLElement) {}

  public abstract render(): this;
  public abstract remove(): void;
}

export { BaseElement };
