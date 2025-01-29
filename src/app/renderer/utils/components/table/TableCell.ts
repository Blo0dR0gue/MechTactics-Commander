import { ObjectWithKeys } from '../../../../types/UtilityTypes';
import { getDeepestObjectForPath, getLastPathPart } from '../../Utils';
import { BaseElement } from '../BaseElement';
import { Button } from '../Button';
import { TableError } from './Table';
import { TableRow } from './TableRow';
import { TableCellData } from './TableTypes';

class TableCell<T extends ObjectWithKeys> extends BaseElement {
  private cellElement: HTMLTableCellElement;

  public constructor(
    parentElement: HTMLTableRowElement,
    private readonly rowElement: TableRow<T>,
    private readonly cellData: TableCellData<T>
  ) {
    super(parentElement);
  }

  private createElement() {
    const { data, span, classNames, cellType } = this.cellData;
    this.cellElement = document.createElement(cellType ? cellType : 'td');
    if (classNames) this.cellElement.classList.add(...classNames);

    if (span) this.cellElement.colSpan = span;

    if (data.type === 'binding') {
      const { dataElement, dataAttribute, formatter } = data;
      // render a text cell using the value defined in the attribute inside the dateElement.
      try {
        const deepestObj = getDeepestObjectForPath(dataElement, dataAttribute);
        const deepestPath = getLastPathPart(dataAttribute);
        const objValue = deepestObj[deepestPath];
        const sValue = formatter
          ? formatter.format(objValue)
          : (objValue as string);

        this.cellElement.textContent = sValue;
      } catch (err) {
        if (err instanceof Error) {
          console.trace(err.message);
        }
      }
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
    this.cellElement.innerHTML = '';
    this.parentElement.removeChild(this.cellElement);
  }
}

export { TableCell };
