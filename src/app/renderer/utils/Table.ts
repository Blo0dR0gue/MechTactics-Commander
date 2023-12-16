import { Binding } from './Binding';

type Icon = SVGElement & HTMLElement;
type ColSizes =
  | 'col-1'
  | 'col-2'
  | 'col-3'
  | 'col-4'
  | 'col-5'
  | 'col-6'
  | 'col-auto';
type ObjectWithKeys = Record<string, unknown>;

/**
 * Defines one button which can be added to a column
 */
interface Button<T extends ObjectWithKeys> {
  text?: string;
  classNames?: string[];
  icon?: Icon;
  onClick?: (data: T, rowidx: number) => void;
}

/**
 * Defines one column
 */
interface ColumnData<T extends ObjectWithKeys> {
  name: string;
  dataAttribute?: Extract<keyof T, string>; // not string | number | symbol only string
  size: ColSizes;
  buttons?: Button<T>[];
}

class TableError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TableError.prototype);
  }
}

/**
 * Dynamic table renderer with data binding
 * TODO: Search and pagination
 * TODO: allow formatter
 */
class Table<T extends ObjectWithKeys> {
  private tableElement: HTMLTableElement;
  private data: T[];
  private bindings: Binding[];

  public constructor(
    private parentElement: HTMLElement,
    classNames: string[],
    private columnDefinitions: ColumnData<T>[]
  ) {
    this.tableElement = document.createElement('table');
    this.tableElement.classList.add(...classNames);
  }

  /**
   * Render this table. <br>
   * setData should be called before.
   */
  public render(): void {
    if (!this.data || this.data.length < 1) {
      throw new TableError(`No data defined`);
    }

    this.clearDataBindings();

    this.renderTableHeaders();
    this.renderRows();

    this.parentElement.appendChild(this.tableElement);
  }

  /**
   * Clear data bindings
   */
  private clearDataBindings() {
    if (!this.bindings || this.bindings.length < 1) this.bindings = [];

    for (const binding of this.bindings) {
      binding.unbind();
    }
    this.bindings = [];
  }

  /**
   * Render the table headers
   */
  private renderTableHeaders(): void {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // for each column definition create a th (column) element and add its name and size
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

    // for each data element create a row and add for each column a td (table cell) element with its content. Either text with binding or a column with buttons (action buttons)
    for (const data of this.data) {
      const tr = document.createElement('tr');
      for (const columnDefinition of this.columnDefinitions) {
        const { buttons, dataAttribute } = columnDefinition;
        const td = document.createElement('td');

        if (dataAttribute !== undefined) {
          // render a text cell
          if (data[dataAttribute]) {
            // property is in object -> create binding
            const binding = new Binding(data, dataAttribute);
            binding.addBinding(td, 'textContent', 'none');
            this.bindings.push(binding);
          } else {
            // TODO: Allow undefined properties.
            td.textContent = String('');
          }
        } else if (buttons !== undefined && buttons.length > 0) {
          // render the button cell

          // for each button definition render one button
          for (const button of buttons) {
            const { text, classNames, icon, onClick } = button;

            if (!text && !icon) {
              throw new TableError(
                `You must define either text or an icon for a button. ${button}`
              );
            }

            const btn = document.createElement('button');

            if (classNames) btn.classList.add(...classNames);

            if (icon) {
              if (text) icon.classList.add('pe-1'); // add padding to the right, if also a text should be rendered
              btn.append(icon);
            }

            if (onClick) {
              // Add the click event handler
              btn.addEventListener('click', () => {
                onClick(data, tr.rowIndex - 1); // -1, because headers are row 0
              });
            }

            if (text) {
              // If a text should be added expand the inner html to not override a possible icon.
              btn.innerHTML += encodeURIComponent(text);
            }

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

  /**
   * Set the data of this table.
   * @param data The new data
   */
  public setData(data: T[]): void {
    this.data = data;
    // TODO: Update Table if rendered
  }
}

export { Table, TableError };
