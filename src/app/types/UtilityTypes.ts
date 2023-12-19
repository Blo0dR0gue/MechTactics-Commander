/**
 * Defines an object which has string as keys
 */
type ObjectWithKeys = Record<string, unknown>;

/**
 * Get all props of an object recursive
 * @example
 * {name: 'test', text: 'hello'} => 'name' | 'text'
 * {name: 'test', coord: {x: 1, y: 1}} => 'name' | 'text' | 'coord' | 'coord.x' | 'coord.y'
 */
type ObjectPropsRec<T, U extends keyof T = keyof T> = U extends string
  ? T[U] extends object
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

export { ObjectWithKeys, ObjectOfPropRec, ObjectPropsRec };
