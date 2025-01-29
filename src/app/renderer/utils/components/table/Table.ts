import {
  TypeOfObjectPropRec,
  ObjectWithKeys
} from '../../../../types/UtilityTypes';
import { Button } from '../Button';
import { RingLoadingIndicator } from '../RingLoadingIndicator';
import { TableRow } from './TableRow';
import {
  CellDataBinding,
  CellDataButton,
  CellDataClassic,
  TableCellData,
  TableColumnData,
  TableActionBarData
} from './TableTypes';

import './table.scss';

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

  private loader: RingLoadingIndicator;

  private currentPage: number;
  private filterText: string;
  private paginationContainer: HTMLDivElement;

  private rows: TableRow<T>[] = [];
  private sorter: (v1: T, v2: T) => number;

  private tableHolder: HTMLDivElement;

  /**
   * Create a new dynamic table
   * @param parentElement The dom element, in which this table should be rendered
   * @param classNames A list of css classes to add to the table element
   * @param itemsPerPage The max amount of items, which should be rendered on one page of this table (pagination)
   * @param headerData Header definition
   * @param columnDefinitions
   */
  public constructor(
    private readonly parentElement: HTMLElement,
    classNames: string[],
    private itemsPerPage: number,
    private readonly headerData: TableActionBarData,
    private readonly columnDefinitions: TableColumnData<T>[]
  ) {
    this.tableHolder = document.createElement('div');
    this.tableHolder.classList.add('overflow-auto');
    this.tableHolder.style.flex = '1';
    this.tableElement = document.createElement('table');
    this.tableElement.classList.add('flex', 'overflow-auto', 'flex-grow-1');
    this.tableElement.classList.add(...classNames);
    this.loader = new RingLoadingIndicator(this.parentElement, 'lds-ring-dark');

    this.currentPage = 1;
    this.filterText = '';
  }

  /**
   * Render this table.
   *
   * setData should be called before.
   */
  public render(): void {
    if (!this.data) {
      throw new TableError(`No data defined`);
    }

    if (this.tableHolder.parentNode) {
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
  private clearRows() {
    for (const row of this.rows) {
      row.remove();
    }
    this.rows = [];
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

        const btn = new Button(this.headerElement, button); //this.createBasicButton(button);

        if (onClick) {
          // Add the click event handler
          btn.getButtonElement().addEventListener('click', () => {
            onClick();
          });
        }

        //this.headerElement.appendChild(btn);
        btn.render();
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

    this.tableHolder.appendChild(this.tableElement);
    this.parentElement.appendChild(this.tableHolder);
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
  public updateTable(): void {
    if (this.tableHolder.parentNode != this.parentElement) {
      throw new TableError("Table is not rendered. Can't update the table");
    }
    this.loader.show();

    // TODO: do not clear like this?
    this.tableElement.removeChild(this.tableElement.tBodies[0]);
    this.tableElement.removeChild(this.tableElement.tHead);

    this.clearRows();

    // Calculate indices for the pagination (which items should be displayed)
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Keep only the data, which matches the filter
    // TODO: optimize that. if the formatter is slow this is also very slow!!!
    const filteredData = this.data.filter((obj) => {
      return Object.keys(obj).some((key) => {
        const value = obj[key] as TypeOfObjectPropRec<T, keyof T>;

        const cols = this.columnDefinitions.filter(
          (col) => col.data.type == 'binding' && col.data.dataAttribute == key
        );

        // Maybe one data attribute is used for multiple column data fields, so we check all of them
        return cols.some((col) => {
          if (col.data.type == 'binding') {
            if (col.data?.formatter) {
              const data = col.data.formatter.format(value).toLowerCase();
              return data.includes(this.filterText);
            } else {
              return String(value).toLowerCase().includes(this.filterText);
            }
          }
        });
      });
    });

    this.renderTableHeaders();
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
    new TableRow(thead, {
      rowIndex: 0,
      cells: this.columnDefinitions.map((col) => {
        return {
          data: {
            type: 'classic',
            text: col.header.name
          },
          classNames: [col.header.size],
          cellType: 'th'
        } as TableCellData<T>;
      })
    }).render();
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

    if (rowData.length <= 0) {
      // if we have no data, show no data row
      this.rows.push(
        new TableRow<T>(tbody, {
          cells: [
            {
              data: { type: 'classic', text: 'No Data!' },
              span: this.columnDefinitions.length,
              classNames: ['text-center', 'h5'] //TODO: Remove bootstrap classes
            }
          ],
          rowIndex: 0
        }).render()
      );
    } else {
      // for each data element create a row and add for each column a td (table cell) element with its content. Either text with binding or a column with buttons (action buttons)
      for (const data of rowData) {
        this.rows.push(
          new TableRow<T>(tbody, {
            rowIndex: this.data.indexOf(data),
            cells: this.columnDefinitions.map((col) => {
              if (col.data.type === 'binding') {
                const cellData = col.data as CellDataBinding<T>;
                cellData.dataElement = data;
                return {
                  data: cellData
                } as TableCellData<T>;
              } else if (col.data.type === 'button') {
                const cellData = col.data as CellDataButton<T>;
                cellData.dataElement = data;
                return {
                  data: cellData
                } as TableCellData<T>;
              } else if (col.data.type === 'classic') {
                const cellData = col.data as CellDataClassic;
                return {
                  data: cellData
                } as TableCellData<T>;
              }
            })
          }).render()
        );
      }
    }

    this.tableElement.appendChild(tbody);
  }

  /**
   * Remove this table from the dom
   */
  public remove() {
    if (this.tableHolder.parentNode === this.parentElement) {
      this.clearRows();
      this.tableHolder.innerHTML = '';
      this.tableElement.innerHTML = '';
      this.parentElement.removeChild(this.headerElement);
      this.parentElement.removeChild(this.tableHolder);
      this.parentElement.removeChild(this.footerElement);
      this.currentPage = 1;
      this.filterText = '';
    }
  }

  /**
   * Set the data of this table.
   * @param data The new data
   */
  public setData(data: T[], sorter?: (v1: T, v2: T) => number): void {
    this.data = data;
    this.sorter = sorter;
    if (sorter) this.data.sort(sorter);
    if (this.tableHolder.parentNode === this.parentElement) {
      this.updateTable();
    }
  }

  /**
   * Add a new data element(s) to the table
   * @param data
   */
  public addData(data: T): void;
  public addData(data: T[]): void;
  public addData(data: T | T[]): void {
    this.clearRows();

    if (Array.isArray(data)) {
      this.data.push(...data);
    } else {
      this.data.push(data);
    }
    if (this.sorter) this.data.sort(this.sorter);

    if (this.tableHolder.parentNode === this.parentElement) {
      this.updateTable();
    }
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
    this.clearRows();
    this.data.splice(idx, 1);
    if (this.sorter) this.data.sort(this.sorter);
    if (this.tableHolder.parentNode === this.parentElement) {
      this.updateTable();
    }
  }

  public addColumn(columnData: TableColumnData<T>): void {
    this.columnDefinitions.push(columnData);
    if (this.tableHolder.parentNode === this.parentElement) this.updateTable();
  }

  public addColumnAt(columnData: TableColumnData<T>, index: number): void {
    this.columnDefinitions.splice(index, 0, columnData);
    if (this.tableHolder.parentNode === this.parentElement) this.updateTable();
  }

  public removeColumnByIndex(index: number): void {
    this.columnDefinitions.splice(index, 1);
    if (this.tableHolder.parentNode === this.parentElement) this.updateTable();
  }

  public getColumns(): TableColumnData<T>[] {
    return this.columnDefinitions;
  }
}

export { Table, TableError };
