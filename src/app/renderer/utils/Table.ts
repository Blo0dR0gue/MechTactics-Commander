import {
  ObjectOfPropRec,
  ObjectPropsRec,
  ObjectWithKeys,
} from '../../types/UtilityTypes';
import { Binding } from './Binding';
import { RingLoadingIndicator } from './RingLoadingIndicator';

type Icon = SVGElement & HTMLElement;
type ColSizes =
  | 'col-1'
  | 'col-2'
  | 'col-3'
  | 'col-4'
  | 'col-5'
  | 'col-6'
  | 'col-auto';

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
  size: ColSizes;
  dataAttribute?: ObjectPropsRec<T>;
  formatter?: (value: ObjectOfPropRec<T>) => string; // TODO: Optimize this, so that this is the real object type
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
 * TODO: pagination
 */
class Table<T extends ObjectWithKeys> {
  private headerElement: HTMLElement;
  private tableElement: HTMLTableElement;
  private footerElement: HTMLElement;
  private data: T[];
  private bindings: Binding[];
  private loader: RingLoadingIndicator;
  private rowFilterDataMap: string[][];

  public constructor(
    private parentElement: HTMLElement,
    classNames: string[],
    private columnDefinitions: ColumnData<T>[]
  ) {
    this.tableElement = document.createElement('table');
    this.tableElement.classList.add(...classNames);
    this.loader = new RingLoadingIndicator(this.parentElement, 'lds-ring-dark');
  }

  /**
   * Render this table. <br>
   * setData should be called before.
   */
  public render(): void {
    if (!this.data || this.data.length < 1) {
      throw new TableError(`No data defined`);
    }

    this.loader.show();

    setTimeout(() => {
      this.clearDataBindings();
      this.renderHeader();
      this.renderTable();
      this.renderFooter();
      this.loader.hide();
    }, 100);
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

  private renderHeader(): void {
    // TODO: make dynamic like the css classes and to render a searchbar or not and also be able to add more data
    this.headerElement = document.createElement('header');
    this.headerElement.classList.add(
      ...'navbar border-bottom d-flex justify-content-center bg-light sticky-top'.split(
        ' '
      )
    );

    const searchbar = document.createElement('input');
    searchbar.type = 'text';
    searchbar.id = 'search-input';
    searchbar.classList.add('form-control');
    searchbar.placeholder = 'Search...';

    searchbar.addEventListener('input', () => {
      // filter the table on input
      const filter = searchbar.value.toLowerCase();
      const rows = this.tableElement.rows;

      for (let i = 0; i < rows.length - 1; i++) {
        const shouldShow = this.rowFilterDataMap[i].some(function (
          cellContent
        ) {
          return String(cellContent).toLowerCase().indexOf(filter) > -1;
        });

        rows[i + 1].style.display = shouldShow ? '' : 'none';
      }
    });

    const searchbarWrapper = document.createElement('div');
    searchbarWrapper.append(searchbar);

    this.headerElement.appendChild(searchbarWrapper);

    this.parentElement.appendChild(this.headerElement);
  }

  private renderTable(): void {
    this.renderTableHeaders();
    this.renderRows();

    // TODO: get ride of filter data map and use this.data. (We need to apply possible filters on the data before checking)
    this.rowFilterDataMap = Array.from(this.tableElement.rows)
      .slice(1)
      .map(function (row) {
        return Array.from(row.getElementsByTagName('td')).map(function (cell) {
          return cell.textContent.toLowerCase();
        });
      });

    this.parentElement.appendChild(this.tableElement);
  }

  private renderFooter(): void {
    // TODO: make dynamic like the css and to be able to enable the pagination
    this.footerElement = document.createElement('footer');

    this.footerElement.classList.add(
      ...'navbar border-bottom d-flex justify-content-center bg-light sticky-bottom'.split(
        ' '
      )
    );

    const paginationContainer = document.createElement('div');
    const pagination = document.createElement('div');
    pagination.textContent = '1';
    pagination.classList.add(...'pagination btn btn-sm'.split(' '));
    paginationContainer.appendChild(pagination);

    this.footerElement.appendChild(paginationContainer);

    this.parentElement.appendChild(this.footerElement);
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
        const { buttons, dataAttribute, formatter } = columnDefinition;
        const td = document.createElement('td');

        if (dataAttribute !== undefined) {
          // render a text cell using data binding
          const binding = new Binding(data, dataAttribute);
          binding.addBinding(td, 'textContent', 'none', formatter);
          this.bindings.push(binding);
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
              btn.appendChild(icon.cloneNode(true));
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
   * Remove this table from the dom
   */
  public remove() {
    this.clearDataBindings();
    this.parentElement.removeChild(this.headerElement);
    this.parentElement.removeChild(this.tableElement);
    this.parentElement.removeChild(this.footerElement);
  }

  /**
   * Set the data of this table.
   * @param data The new data
   */
  public setData(data: T[]): void {
    this.data = data;
  }
}

export { Table, TableError };
