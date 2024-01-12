import {
  ObjectPropsRec,
  ObjectWithKeys,
  TypeOfObjectPropRec,
} from '../../../../types/UtilityTypes';
import { BaseElement } from '../BaseElement';
import { Binding } from '../Binding';
import { Button } from '../Button';
import { Formatter } from '../formatter/Formatter';
import { RowButton } from './Table';

type CellData<T extends ObjectWithKeys> = {
  rowIndex: number;
  classic?: {
    text: string;
  };
  button?: {
    data: T;
    buttons: RowButton<T>[];
  };
  binding?: {
    data: T;
    dataAttribute: ObjectPropsRec<T>;
    formatter: Formatter<TypeOfObjectPropRec<T>, unknown>;
  };
};

class TableCell<T extends ObjectWithKeys> extends BaseElement {
  private cellElement: HTMLTableCellElement;
  binding: Binding<unknown>;

  public constructor(
    protected readonly parentElement: HTMLTableRowElement,
    private readonly cellData: CellData<T>
  ) {
    super(parentElement);
  }

  private createElement() {
    const { classic, button, binding, rowIndex } = this.cellData;
    this.cellElement = document.createElement('td');

    if (binding) {
      const { data, dataAttribute, formatter } = binding;
      // render a text cell using data binding
      this.binding = new Binding<unknown>(data, dataAttribute);
      this.binding.addBinding(
        this.cellElement,
        'textContent',
        false,
        formatter
      );
    } else if (button) {
      // render the button cell
      const { buttons, data } = button;

      // for each button definition render one button
      for (const button of buttons) {
        const { onClick, enabled } = button;

        const btn = new Button(this.cellElement, button); //this.createBasicButton(button);

        if (onClick) {
          // Add the click event handler
          btn.getButtonElement().addEventListener('click', () => {
            onClick(data, rowIndex, this.parentElement.rowIndex - 1);
          });
        }

        if (enabled) {
          btn.disable(
            !enabled(data, rowIndex, this.parentElement.rowIndex - 1)
          );
        }
        btn.render();
      }
    } else if (classic) {
      const { text } = classic;
      this.cellElement.textContent = text;
    } else {
      throw new Error(
        `classic, binding or button needs to be defined ${this.cellData}`
      );
    }
  }

  public render(): this {
    this.createElement();
    this.parentElement.appendChild(this.cellElement);
    return this;
  }
  public remove(): void {
    if (this.binding)
      this.binding.removeBinding(this.cellElement, 'textContent');
    this.cellElement.innerHTML = '';
    this.parentElement.removeChild(this.cellElement);
  }
}

export { TableCell };
