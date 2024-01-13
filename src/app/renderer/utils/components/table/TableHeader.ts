import { BaseElement } from '../BaseElement';

class TableHeader extends BaseElement {
  public constructor(parentElement: HTMLElement) {
    super(parentElement);
  }

  public render(): this {
    throw new Error('Method not implemented.');
  }
  public remove(): void {
    throw new Error('Method not implemented.');
  }
}

export { TableHeader };
