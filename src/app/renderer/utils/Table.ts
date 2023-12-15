type Icon = SVGElement | string;
type ColSizes = 'col-1' | 'col-2' | 'col-3' | 'col-4' | 'col-5';

interface Button<T> {
  text: string;
  classNames?: string[];
  icon?: Icon;
  onClick?: (data: T, rowidx: number) => void;
}

interface ColumnData<T> {
  name: string;
  dataAttribute: keyof T;
  size?: ColSizes;
  buttons?: Button<T>[];
}

class TableError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TableError.prototype);
  }
}

class Table<T> {
  private parentElement: HTMLElement;
  private tableElement: HTMLTableElement;
  private data: T | undefined;

  public constructor(
    parentElement: HTMLElement,
    columnDefinitions: ColumnData<T>[]
  ) {
    this.parentElement = parentElement;
    this.tableElement = document.createElement('table');
  }

  public render(): void {
    console.log(this.data);
    // TODO: Render table
    this.parentElement.appendChild(this.tableElement);
  }

  private renderTableHeaders(): void {
    // TODO: Create and append table headers based on columnDefinitions
  }

  private renderRows(): void {
    // TODO: Iterate through data and create rows
  }

  public setData(data: T): void {
    this.data = data;
    // TODO: Update Table if rendered
  }
}

export { Table };
