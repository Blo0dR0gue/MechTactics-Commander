/**
 * Defines an object which has string as keys
 */
type ObjectWithKeys = Record<string, unknown>;

type Icon = SVGElement & HTMLElement;

/**
 * Get all props of an object recursive
 * @example
 * {name: 'test', text: 'hello'} => 'name' | 'text'
 * {name: 'test', coord: {x: 1, y: 1}} => 'name' | 'text' | 'coord' | 'coord.x' | 'coord.y'
 */
type ObjectPropsRec<T, U extends keyof T = keyof T> = U extends string
  ? T[U] extends (...args: unknown[]) => unknown
    ? never
    : T[U] extends object
    ? U | `${U & string}.${ObjectPropsRec<T[U]>}`
    : U
  : never;

/**
 * Like ObjectPropsRec but the type is the type of the parameters
 * @example
 * {name: 'test', text: 'hello'} => string
 * {name: 'test', coord: {x: 1, y: 1}} => string | {x: number, y: number}
 */
type ObjectOfPropRec<T, U extends keyof T = keyof T> = U extends string
  ? T[U] extends object
    ? T[U] | ObjectOfPropRec<T[U]>
    : T[U]
  : never;

/**
 * Remove optional from any parameter
 */
type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};

export { Icon, ObjectWithKeys, ObjectOfPropRec, ObjectPropsRec, Concrete };
