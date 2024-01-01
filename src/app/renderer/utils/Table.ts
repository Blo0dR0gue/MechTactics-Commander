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
 * A basic button definition for this table
 */
interface Button {
  /**
   * The display text of the button
   */
  text?: string;
  /**
   * A list of css class names to style this button
   */
  classNames?: string[];
  /**
   * A possible icon element, which is displayed before a possible text
   */
  icon?: Icon;
}

/**
 * A button which can be added to the header
 */
interface HeaderButton extends Button {
  /**
   * Callback handler, which is invoked on click
   */
  onClick?: () => void;
}

/**
 * Defines one button which can be added to a column to be rendered in each row
 */
interface RowButton<T extends ObjectWithKeys> extends Button {
  /**
   * Callback handler, which is invoked on click
   * @param data The data of the row the button got clicked
   * @param rowIdx The overall index of this row
   * @param curRowIdx The current index of this row in the current pagination context
   */
  onClick?: (data: T, rowIdx: number, curRowIdx) => void;
  /**
   * Use this, to define if the button is enabled or not.
   * @param data The data of the row the button got clicked
   * @param rowIdx The overall index of this row
   * @param curRowIdx The current index of this row in the current pagination context
   * @returns true, if the button should be enabled
   */
  enabled?: (data: T, rowIdx: number, curRowIdx) => boolean;
}

/**
 * Defines one column
 */
interface ColumnData<T extends ObjectWithKeys> {
  /**
   * The display name of the column
   */
  name: string;
  /**
   * The size of this column
   */
  size: ColSizes;
  /**
   * The prop of an object from the data, which should be displayed in this column. (Using data binding - one way)
   */
  dataAttribute?: ObjectPropsRec<T>;
  /**
   * A formatter which can be used to update the display of the bound object prop
   * @param value The value of the table block, which is displayed if no formatter is used
   * @returns The new string to display
   */
  formatter?: (value: ObjectOfPropRec<T>) => string; // TODO: Optimize this, so that this is the real object type
  /**
   * A possible list of buttons to display in this column. If dataAttribute is set, this will be ignored
   */
  buttons?: RowButton<T>[];
}

/**
 * Defines the header of the table
 */
interface HeaderData {
  /**
   * Enable / Disable the search bar
   */
  searchBar: boolean;
  /**
   * A list of class names to style the header
   */
  classNames: string[];
  /**
   * A possible list of buttons to display in the header.
   */
  buttons?: HeaderButton[];
}

class TableError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TableError.prototype);
  }
}

/**
 * Dynamic table renderer with data binding
 */
class Table<T extends ObjectWithKeys> {
  private headerElement: HTMLElement;
  private tableElement: HTMLTableElement;
  private footerElement: HTMLElement;

  private data: T[];
  private bindings: Binding[];

  private loader: RingLoadingIndicator;

  private currentPage: number;
  private filterText: string;
  private paginationContainer: HTMLDivElement;

  /**
   * Create a new dynamic table
   * @param parentElement The dom element, in which this table should be rendered
   * @param classNames A list of css classes to add to the table element
   * @param itemsPerPage The max amount of items, which should be rendered on one page of this table (pagination)
   * @param headerData Header definition
   * @param columnDefinitions
   */
  public constructor(
    private parentElement: HTMLElement,
    classNames: string[],
    private itemsPerPage: number,
    private headerData: HeaderData,
    private columnDefinitions: ColumnData<T>[]
  ) {
    this.tableElement = document.createElement('table');
    this.tableElement.classList.add(...classNames);
    this.loader = new RingLoadingIndicator(this.parentElement, 'lds-ring-dark');

    this.currentPage = 1;
    this.filterText = '';

    this.bindings = [];
  }

  /**
   * Render this table.
   *
   * setData should be called before.
   */
  public render(): void {
    if (!this.data || this.data.length < 1) {
      throw new TableError(`No data defined`);
    }

    if (this.tableElement.parentNode) {
      throw new TableError('Table is already rendered!');
    }

    this.loader.show();

    setTimeout(() => {
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

  /**
   * Render the table header with a possible search bar and customize buttons
   */
  private renderHeader(): void {
    const { classNames, searchBar, buttons } = this.headerData;

    this.headerElement = document.createElement('header');
    this.headerElement.classList.add(...classNames);

    if (buttons && buttons.length > 0) {
      for (const button of buttons) {
        const { onClick } = button;

        const btn = this.createBasicButton(button);

        if (onClick) {
          // Add the click event handler
          btn.addEventListener('click', () => {
            onClick();
          });
        }

        this.headerElement.appendChild(btn);
      }
    }

    if (searchBar) {
      const searchbar = document.createElement('input');
      searchbar.type = 'text';
      searchbar.id = 'search-input';
      searchbar.classList.add('form-control');
      searchbar.placeholder = 'Search...';

      searchbar.addEventListener('input', () => {
        // filter the table on input
        this.filterText = searchbar.value.toLowerCase().trim();
        this.currentPage = 1;
        this.updateTable();
      });

      const searchbarWrapper = document.createElement('div');
      searchbarWrapper.append(searchbar);

      this.headerElement.appendChild(searchbarWrapper);
    }

    this.parentElement.appendChild(this.headerElement);
  }

  private renderTable(): void {
    this.renderTableHeaders();
    this.renderRows(0, this.itemsPerPage, this.data);

    this.parentElement.appendChild(this.tableElement);
  }

  private renderFooter(): void {
    // TODO: make dynamic like the css and to be able to enable the pagination
    this.footerElement = document.createElement('footer');

    this.footerElement.classList.add(
      ...'navbar border-bottom d-flex justify-content-center bg-light sticky-bottom flex-row'.split(
        ' '
      )
    );

    this.paginationContainer = document.createElement('div');
    this.paginationContainer.classList.add('d-flex');
    this.paginationContainer.classList.add('flex-row');

    this.updatePagination(this.data.length);

    this.footerElement.appendChild(this.paginationContainer);

    this.parentElement.appendChild(this.footerElement);
  }

  /**
   * Renders the table with the data of the currently selected page and filter. Also updates the pagination items.
   * Remove and add the new rows is more performant then add all rows and hide some of them then.
   */
  private updateTable(): void {
    this.loader.show();

    // Calculate indices for the pagination (which items should be displayed)
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Keep only the data, which matches the filter
    const filteredData = this.data.filter((obj) => {
      return Object.keys(obj).some((key) => {
        const col = this.columnDefinitions.find(
          (col) => col.dataAttribute == key
        );
        if (col?.formatter) {
          const value = obj[key] as ObjectOfPropRec<T, keyof T>;
          return col.formatter(value).toLowerCase().includes(this.filterText);
        } else {
          return String(obj[key]).toLowerCase().includes(this.filterText);
        }
      });
    });

    // TODO: do not clear like this?
    this.tableElement.removeChild(this.tableElement.tBodies[0]);

    this.clearDataBindings();
    this.renderRows(startIndex, endIndex, filteredData);
    this.updatePagination(filteredData.length);

    this.loader.hide();
  }

  /**
   * Updates the displayed selectable pages in the footer
   * @param maxItems The number of items which are currently selectable
   */
  private updatePagination(maxItems: number): void {
    this.paginationContainer.innerHTML = '';

    // show 2 page items before and after the current selected page
    const startX = this.currentPage - 2;
    const endX = this.currentPage + 2;

    const totalPages = Math.ceil(maxItems / this.itemsPerPage);

    this.createPaginationItem('<', this.currentPage - 1, this.currentPage > 1);

    if (startX > 1) {
      this.createPaginationItem('1', 1, true);

      this.createPaginationItem('...', -1, false);
    }

    for (let i = startX; i <= endX; i++) {
      if (i > 0 && i <= totalPages) {
        this.createPaginationItem(String(i), i, true);
      }
    }

    if (endX < totalPages && endX != startX) {
      this.createPaginationItem('...', -1, false);

      this.createPaginationItem(String(totalPages), totalPages, true);
    }

    this.createPaginationItem(
      '>',
      this.currentPage + 1,
      this.currentPage < totalPages
    );
  }

  /**
   * Creates one selectable pagination item and adds it to the pagination container
   * @param itemText
   * @param itemNr
   * @param enabled
   */
  private createPaginationItem(
    itemText: string,
    itemNr: number,
    enabled: boolean
  ) {
    const paginationItem = document.createElement('button');
    paginationItem.textContent = itemText;

    // styling
    paginationItem.classList.add(...'pagination btn btn-sm'.split(' '));
    if (itemNr === this.currentPage)
      paginationItem.classList.add('btn-primary');
    if (!enabled) paginationItem.classList.add('btn-secondary');
    paginationItem.disabled = !enabled;

    // on click handling
    paginationItem.addEventListener('click', () => {
      this.currentPage = itemNr;
      this.updateTable();
    });

    this.paginationContainer.appendChild(paginationItem);
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

  /**
   * Renders the data rows
   *
   * @param startIndex Index from where the data should be displayed
   * @param endIndex Index until where the data should be displayed
   * @param data The data to display. To display all the data set startIndex to 0 and endIndex to Infinity
   */
  private renderRows(
    startIndex: number = 0,
    endIndex: number = this.data.length,
    data: T[]
  ): void {
    const tbody = document.createElement('tbody');

    const rowData = data.slice(startIndex, endIndex);

    // for each data element create a row and add for each column a td (table cell) element with its content. Either text with binding or a column with buttons (action buttons)
    for (const data of rowData) {
      const tr = document.createElement('tr');
      for (const columnDefinition of this.columnDefinitions) {
        const { buttons, dataAttribute, formatter } = columnDefinition;
        const td = document.createElement('td');

        if (dataAttribute !== undefined) {
          // render a text cell using data binding
          const binding = new Binding(data, dataAttribute);
          binding.addBinding(td, 'textContent', false, formatter, 'none');
          this.bindings.push(binding);
        } else if (buttons !== undefined && buttons.length > 0) {
          // render the button cell

          // for each button definition render one button
          for (const button of buttons) {
            const { onClick, enabled } = button;

            const btn = this.createBasicButton(button);

            if (onClick) {
              // Add the click event handler
              btn.addEventListener('click', () => {
                onClick(data, this.data.indexOf(data), tr.rowIndex - 1);
              });
            }

            if (enabled) {
              btn.disabled = !enabled(
                data,
                this.data.indexOf(data),
                tr.rowIndex - 1
              );
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
   * Create a button element
   * @param button A button definition
   * @returns A HTMLButtonElement
   */
  private createBasicButton(button: Button) {
    const { text, icon, classNames } = button;

    if (!text && !icon) {
      throw new TableError(
        `You must define either text or an icon for a button. ${button}`
      );
    }

    const btn = document.createElement('button');

    if (classNames) btn.classList.add(...classNames);

    if (icon) {
      if (text) icon.style.paddingRight = '1rem'; // add padding to the right, if also a text should be rendered
      btn.appendChild(icon.cloneNode(true));
    }

    if (text) {
      // If a text should be added expand the inner html to not override a possible icon.
      btn.innerHTML += encodeURIComponent(text);
    }
    return btn;
  }

  /**
   * Remove this table from the dom
   */
  public remove() {
    if (this.tableElement.parentNode) {
      this.clearDataBindings();
      this.tableElement.innerHTML = '';
      this.parentElement.removeChild(this.headerElement);
      this.parentElement.removeChild(this.tableElement);
      this.parentElement.removeChild(this.footerElement);
      this.currentPage = 1;
      this.filterText = '';
    }
  }

  /**
   * Set the data of this table.
   * @param data The new data
   */
  public setData(data: T[]): void {
    if (this.tableElement.parentNode)
      throw new TableError("Table is already rendered. Can't change data!");
    this.data = data;
  }

  /**
   * Add a new data element(s) to the table
   * @param data
   */
  public addData(data: T): void;
  public addData(data: T[]): void;
  public addData(data: T | T[]): void {
    this.clearDataBindings();

    if (Array.isArray(data)) {
      this.data.push(...data);
    } else {
      this.data.push(data);
    }

    this.updateTable();
  }

  /**
   * Remove a data element from the table. This also removes the data element from the real data array
   * @param data
   */
  public removeData(data: T): void {
    const idx = this.data.findIndex((obj) => obj === data);
    if (idx > -1) {
      this.removeDataByIdx(idx);
    }
  }

  /**
   * Remove a data element from the table by an index. This also removes the data element from the real data array
   * @param data
   */
  public removeDataByIdx(idx: number) {
    this.clearDataBindings();
    this.data.splice(idx, 1);
    this.updateTable();
  }
}

export { Table, TableError };
