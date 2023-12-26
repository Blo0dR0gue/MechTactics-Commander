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
  onClick?: (data: T, rowIdx: number, curRowIdx) => void;
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
 */
class Table<T extends ObjectWithKeys> {
  private headerElement: HTMLElement;
  private tableElement: HTMLTableElement;
  private footerElement: HTMLElement;

  private data: T[];
  private rendered: boolean;
  private bindings: Binding[];

  private loader: RingLoadingIndicator;

  private currentPage: number;
  private filterText: string;
  private paginationContainer: HTMLDivElement;

  public constructor(
    private parentElement: HTMLElement,
    classNames: string[],
    private itemsPerPage: number,
    private columnDefinitions: ColumnData<T>[]
  ) {
    this.tableElement = document.createElement('table');
    this.tableElement.classList.add(...classNames);
    this.loader = new RingLoadingIndicator(this.parentElement, 'lds-ring-dark');

    this.currentPage = 1;
    this.filterText = '';
    this.bindings = [];
    this.rendered = false;
  }

  /**
   * Render this table. <br>
   * setData should be called before.
   */
  public render(): void {
    if (!this.data || this.data.length < 1) {
      throw new TableError(`No data defined`);
    }

    if (this.rendered) {
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
      this.filterText = searchbar.value.toLowerCase();
      this.currentPage = 1;
      this.updateTable();
    });

    const searchbarWrapper = document.createElement('div');
    searchbarWrapper.append(searchbar);

    this.headerElement.appendChild(searchbarWrapper);

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

    this.updatePagination(this.data.length - 1);

    this.footerElement.appendChild(this.paginationContainer);

    this.parentElement.appendChild(this.footerElement);
  }

  private updateTable(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

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
    this.updatePagination(filteredData.length - 1);
  }

  private updatePagination(maxPages: number): void {
    this.paginationContainer.innerHTML = '';

    const startX = this.currentPage - 2;
    const endX = this.currentPage + 2;
    const totalPages = Math.ceil(maxPages / this.itemsPerPage);

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
                onClick(
                  data,
                  tr.rowIndex - 1 + (this.currentPage - 1) * this.itemsPerPage,
                  this.currentPage - 1
                ); // -1, because headers are row 0
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
    this.tableElement.innerHTML = '';
    this.parentElement.removeChild(this.headerElement);
    this.parentElement.removeChild(this.tableElement);
    this.parentElement.removeChild(this.footerElement);
    this.rendered = false;
  }

  /**
   * Set the data of this table.
   * @param data The new data
   */
  public setData(data: T[]): void {
    if (this.rendered)
      throw new TableError("Table is already rendered. Can't change data!");
    this.data = data;
  }

  /**
   * Add a new data element to the table
   * @param data
   */
  public addData(data: T): void {
    this.clearDataBindings();
    this.data.push(data);
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
