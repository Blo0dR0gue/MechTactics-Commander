import { ObjectWithKeys } from '../../../../types/UtilityTypes';
import { BaseElement } from '../BaseElement';
import { ColumnData } from './Table';
import { TableCell } from './TableCell';

type RowData<T extends ObjectWithKeys> = {
  data: T;
  rowIndex: number;
  columns: ColumnData<T>[];
};

class TableRow<T extends ObjectWithKeys> extends BaseElement {
  private rowElement: HTMLTableRowElement;

  private cells: TableCell<T>[] = [];

  public constructor(
    baseElement: HTMLElement,
    private readonly rowData: RowData<T>
  ) {
    super(baseElement);
  }

  private createElement() {
    const { data, rowIndex, columns } = this.rowData;
    this.rowElement = document.createElement('tr');

    for (const column of columns) {
      const { buttons, dataAttribute, formatter, text } = column;

      // TODO: Optimize that
      if (dataAttribute) {
        this.cells.push(
          new TableCell<T>(this.rowElement, {
            rowIndex: rowIndex,
            binding: {
              data: data,
              dataAttribute: dataAttribute,
              formatter: formatter,
            },
          }).render()
        );
      } else if (buttons) {
        this.cells.push(
          new TableCell<T>(this.rowElement, {
            rowIndex: rowIndex,
            button: {
              buttons: buttons,
              data: data,
            },
          }).render()
        );
      } else if (text) {
        this.cells.push(
          new TableCell<T>(this.rowElement, {
            rowIndex: rowIndex,
            classic: {
              text: text,
            },
          }).render()
        );
      }
    }
  }

  public render(): this {
    this.createElement();
    this.parentElement.appendChild(this.rowElement);
    return this;
  }
  public remove(): void {
    for (const cell of this.cells) {
      cell.remove();
    }
    this.rowElement.innerHTML = '';
    this.parentElement.removeChild(this.rowElement);
  }
}

export { TableRow };
