import { BaseElement } from './BaseElement';

export type DropdownItem = {
  value: string;
  default?: boolean;
};

export class Dropdown extends BaseElement {
  private items: DropdownItem[];
  private selectElement: HTMLSelectElement;
  private defaultItem: DropdownItem | null;
  private rendered: boolean;

  public constructor(parentElement: HTMLSelectElement) {
    super(parentElement);
    this.selectElement = parentElement;
    this.items = [];
    this.rendered = false;
  }

  public setItems(items: DropdownItem[]): this {
    if (items.length === 0) {
      return;
    }

    const uniqueItems = Array.from(
      new Map(items.map((item) => [item.value, item])).values()
    );

    this.defaultItem = uniqueItems.find((item) => item.default) ?? items[0];

    this.items = uniqueItems;

    if (this.rendered) {
      this.remove();
      this.render();
    }

    return this;
  }

  public getSelected(): DropdownItem | null {
    const selectedValue = this.selectElement.value;
    return this.items.find((item) => item.value === selectedValue) || null;
  }

  public setSelected(value: string): this {
    if (this.items.length === 0) {
      return;
    }

    const item = this.items.find((item) => item.value === value);
    if (item) {
      this.selectElement.value = item.value;
    } else {
      this.selectElement.value = this.defaultItem.value;
    }
    return this;
  }

  public render(): this {
    if (this.rendered) {
      return;
    }
    this.rendered = true;

    this.items.forEach((item) => {
      const dropdownItem = this.createDropdownItemElement(item);
      this.selectElement.appendChild(dropdownItem);
    });

    this.selectElement.value = this.defaultItem.value;

    return this;
  }

  public remove(): void {
    this.rendered = false;
    this.selectElement.innerHTML = '';
    this.selectElement.value = null;
  }

  private createDropdownItemElement(item: DropdownItem): HTMLOptionElement {
    const option = document.createElement('option');
    option.dataset.key = item.value;
    option.value = item.value;
    option.textContent = item.value;
    return option;
  }
}
