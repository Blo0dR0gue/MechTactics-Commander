import { ObjectWithKeys } from '../../../../types/UtilityTypes';
import { BaseElement } from '../BaseElement';
import { Binding } from '../Binding';
import { Button } from '../Button';
import { TableError } from './Table';
import { TableRow } from './TableRow';
import { TableCellData } from './TableTypes';

class TableCell<T extends ObjectWithKeys> extends BaseElement {
  private cellElement: HTMLTableCellElement;
  binding: Binding<unknown>;

  public constructor(
    parentElement: HTMLTableRowElement,
    private readonly rowElement: TableRow<T>,
    private readonly cellData: TableCellData<T>
  ) {
    super(parentElement);
  }

  private createElement() {
    const { data, span, classNames } = this.cellData;
    this.cellElement = document.createElement('td');
    if (classNames) this.cellElement.classList.add(...classNames);

    if (span) this.cellElement.colSpan = span;

    if (data.type === 'binding') {
      const { dataElement, dataAttribute, formatter } = data;
      // render a text cell using data binding
      this.binding = new Binding<unknown>(dataElement, dataAttribute);
      this.binding.addBinding(
        this.cellElement,
        'textContent',
        false,
        formatter
      );
    } else if (data.type === 'button') {
      // render the button cell
      const { buttons, dataElement } = data;

      // for each button definition render one button
      for (const button of buttons) {
        const { onClick, enabled } = button;

        const btn = new Button(this.cellElement, button); //this.createBasicButton(button);

        if (onClick) {
          // Add the click event handler
          btn.getButtonElement().addEventListener('click', () => {
            onClick(
              dataElement,
              this.rowElement.getGlobalRowIndex(),
              this.rowElement.getLocalRowIndex()
            );
          });
        }

        if (enabled) {
          btn.disable(
            !enabled(
              dataElement,
              this.rowElement.getGlobalRowIndex(),
              this.rowElement.getLocalRowIndex()
            )
          );
        }
        btn.render();
      }
    } else if (data.type === 'classic') {
      const { text } = data;
      this.cellElement.textContent = text;
    } else {
      throw new TableError(
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
