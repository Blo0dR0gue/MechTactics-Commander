import { ObjectWithKeys } from '../../../../types/UtilityTypes';
import { BaseElement } from '../BaseElement';
import { TableCell } from './TableCell';
import { TableRowData } from './TableTypes';

class TableRow<T extends ObjectWithKeys> extends BaseElement {
  private rowElement: HTMLTableRowElement;

  private cells: TableCell<T>[] = [];

  public constructor(
    baseElement: HTMLElement,
    private readonly rowData: TableRowData<T>
  ) {
    super(baseElement);
  }

  private createElement() {
    const { columns, classNames } = this.rowData;
    this.rowElement = document.createElement('tr');
    if (classNames) this.rowElement.classList.add(...classNames);

    for (const column of columns) {
      this.cells.push(new TableCell<T>(this.rowElement, this, column).render());
    }
  }

  /**
   * Gets the global row index (not the index if the visible rows)
   * @returns
   */
  public getGlobalRowIndex(): number {
    return this.rowData.rowIndex;
  }

  /**
   * Gets the local row index of the visible rows
   * @returns
   */
  public getLocalRowIndex(): number {
    return this.rowElement.rowIndex - 1;
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
