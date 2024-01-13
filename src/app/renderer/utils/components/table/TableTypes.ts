import {
  ObjectWithKeys,
  ObjectPropsRec,
  TypeOfObjectPropRec,
} from '../../../../types/UtilityTypes';
import { ButtonData } from '../Button';
import { Formatter } from '../formatter/Formatter';

type ColSizes =
  | 'col-1'
  | 'col-2'
  | 'col-3'
  | 'col-4'
  | 'col-5'
  | 'col-6'
  | 'col-auto'
  | 'col-space-1'
  | 'col-space-2'
  | 'col-space-3'
  | 'col-space-4'
  | 'col-space-5'
  | 'col-space-6'
  | 'col-space-7';

/**
 * A button which can be added to the header
 */
type HeaderButton = ButtonData & {
  /**
   * Callback handler, which is invoked on click
   */
  onClick?: () => void;
};

/**
 * Defines one button which can be added to a column to be rendered in each row
 */
type RowButton<T extends ObjectWithKeys> = ButtonData & {
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
};

type HeaderData = {
  /**
   * The display name of the column
   */
  name: string;
  /**
   * The size of this column
   */
  size: ColSizes;
};

/**
 * Defines one column
 */
type TableColumnData<T extends ObjectWithKeys> = {
  header: HeaderData;
  data: ColumnDataBinding<T> | ColumnDataButton<T> | ColumnDataClassic;
};

type ColumnDataClassic = {
  type: 'classic';
  /**
   * To just define a text. Can only be used, iff dataAttribute and buttons is not set
   */
  text: string;
};

type ColumnDataButton<T extends ObjectWithKeys> = {
  type: 'button';
  /**
   * A possible list of buttons to display in this column. If dataAttribute is set, this will be ignored
   */
  buttons: RowButton<T>[];
};

type ColumnDataBinding<T extends ObjectWithKeys> = {
  type: 'binding';
  /**
   * The prop of an object from the data, which should be displayed in this column. (Using data binding - one way)
   */
  dataAttribute: ObjectPropsRec<T>;
  /**
   * A formatter which can be used to update the display of the bound object prop
   * @param value The value of the table block, which is displayed if no formatter is used
   * @returns The new string to display
   */
  formatter?: Formatter<TypeOfObjectPropRec<T>, string>; // TODO: Optimize this, so that this is the real object type
};

type TableRowData<T extends ObjectWithKeys> = {
  rowIndex: number;
  columns: TableCellData<T>[];
};

type TableCellData<T extends ObjectWithKeys> = {
  span?: number;
  data: CellDataClassic | CellDataBinding<T> | CellDataButton<T>;
};

type CellDataClassic = ColumnDataClassic;

type CellDataButton<T extends ObjectWithKeys> = ColumnDataButton<T> & {
  dataElement: T;
};

type CellDataBinding<T extends ObjectWithKeys> = ColumnDataBinding<T> & {
  dataElement: T;
};

/**
 * Defines the header of the table
 */
type TableHeaderData = {
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
};

export {
  TableColumnData,
  TableRowData,
  TableCellData,
  TableHeaderData,
  CellDataBinding,
  CellDataButton,
  CellDataClassic,
};
