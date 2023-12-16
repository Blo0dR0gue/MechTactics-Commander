import { Binding } from './Binding';

type Icon = SVGElement & HTMLElement;
type ColSizes = 'col-1' | 'col-2' | 'col-3' | 'col-4' | 'col-5';

interface Button<T extends ObjectWithKeys> {
  text?: string;
  classNames?: string[];
  icon?: Icon;
  onClick?: (data: T, rowidx: number) => void;
}

interface ColumnData<T extends ObjectWithKeys> {
  name: string;
  dataAttribute?: keyof T;
  size: ColSizes;
  buttons?: Button<T>[];
}

class TableError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TableError.prototype);
  }
}

type ObjectWithKeys = Record<string, unknown>;

// TODO: Use data binding!!!
class Table<T extends ObjectWithKeys> {
  private tableElement: HTMLTableElement;
  private data: T[];
  private bindings: Binding[];

  public constructor(
    private parentElement: HTMLElement,
    private classNames: string[],
    private columnDefinitions: ColumnData<T>[]
  ) {
    this.tableElement = document.createElement('table');
    this.tableElement.classList.add(...classNames);
  }

  public render(): void {
    if (!this.data || this.data.length < 1) {
      throw new TableError(`No data defined`);
    }

    this.renderTableHeaders();
    this.renderRows();

    this.parentElement.appendChild(this.tableElement);
  }

  private renderTableHeaders(): void {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    for (const columnDefinition of this.columnDefinitions) {
      const th = document.createElement('th');
      th.textContent = columnDefinition.name;
      th.classList.add(columnDefinition.size);
      headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    this.tableElement.appendChild(thead);
  }

  private renderRows(): void {
    const tbody = document.createElement('tbody');

    for (const data of this.data) {
      const tr = document.createElement('tr');
      for (const columnDefinition of this.columnDefinitions) {
        const { buttons, dataAttribute } = columnDefinition;
        const td = document.createElement('td');

        if (dataAttribute !== undefined) {
          // Render the text
          td.textContent = String(data[dataAttribute] || '');
        } else if (buttons !== undefined && buttons.length > 0) {
          // render the buttons
          for (const button of buttons) {
            const { text, classNames, icon, onClick } = button;
            const btn = document.createElement('button');
            if (classNames) btn.classList.add(...classNames);
            if (icon) {
              icon.classList.add('pe-1');
              btn.append(icon);
            }
            if (onClick)
              btn.addEventListener('click', () => {
                onClick(data, tr.rowIndex);
              });
            if (text) btn.innerHTML += encodeURIComponent(text);
            if (!text && !icon)
              throw new TableError(
                `You must define either text or an icon for a button. ${button}`
              );
            td.appendChild(btn);
          }
        } else {
          throw new TableError(
            `Either buttons or dataAttribute need to be defined ${columnDefinition}`
          );
        }

        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    this.tableElement.appendChild(tbody);
  }

  public setData(data: T[]): void {
    this.data = data;
    // TODO: Update Table if rendered
  }
}

export { Table, TableError };
