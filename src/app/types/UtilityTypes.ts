/**
 * Defines an object which has string as keys
 */
type ObjectWithKeys = Record<string | number | symbol, unknown>;

type Icon = SVGElement & HTMLElement;

/**
 * Get all props of an object or class(iff public) recursive
 * @example
 * {name: 'test', text: 'hello'} => 'name' | 'text'
 * {name: 'test', coord: {x: 1, y: 1}} => 'name' | 'text' | 'coord' | 'coord.x' | 'coord.y'
 */
type ObjectPropsRec<T, U extends keyof T = keyof T> = U extends string
  ? T[U] extends string | number | symbol
    ? U // If it is a primitive, return the prop name
    : T[U] extends Map<unknown, unknown>
    ? never // If it is a map, do not return the prop name
    : T[U] extends Array<unknown>
    ? U | ArrayPropPath<T[U], U> // If it is an array, return the prop name of the array and also an array path
    : T[U] extends (...args: unknown[]) => unknown
    ? never // If it is a function, do not return the prop name
    : T[U] extends object
    ? U | `${U & string}.${ObjectPropsRec<T[U]>}` // If it is an object, return the prop name of the obj and also recursively concatenate the props of this obj
    : never
  : never;

/**
 * Type to get the path of an array prop. The appendix would be added before the ${number}
 * @example
 * const arr = [{name: 'test'}]
 * type ValidPath = ArrayPropPath<typeof arr>; => `${number}` | `${number}.name`
 * type ValidPath2 = ArrayPropPath<typeof arr, 'arr'>; => `arr.${number}` | `arr.${number}.name`
 * @example
 * const arr = [{name: 'test'}, {test: 1}]
 * type ValidPath = ArrayPropPath<typeof arr>; => `${number}` | `${number}.name | `${number}.test`
 */
type ArrayPropPath<
  T,
  Appendix extends string | undefined = undefined
> = T extends Array<infer E>
  ? E extends object
    ?
        | `${Appendix extends string ? `${Appendix}.` : ''}${number}`
        | `${Appendix extends string
            ? `${Appendix}.`
            : ''}${number}.${ObjectPropsRec<E>}`
    : `${Appendix extends string ? `${Appendix}.` : ''}${number}`
  : never;

/**
 * Type to get the type of the objects inside of an array
 * @example
 * let arr = [{name: 'test', test: {t1: 't2'}}]
 * let arr2 = ['test']
 * type t1 = ArrayObjType<typeof arr> => {name: string; test: { t1: string; };}
 * type t2 = ArrayObjType<typeof arr2> => never
 * @example
 * let arr3 = [{name: 'test'}, {test2: 'test'}]
 * type t3 = ArrayObjType<typeof arr3> => { name: string; test2?: undefined; | { test2: string; name?: undefined;}
 */
type ArrayObjType<T> = T extends Array<infer E>
  ? E extends object
    ? T[number]
    : never
  : never;

/**
 * Like ObjectPropsRec but the type is the type of the parameters
 * @example
 * {name: 'test', text: 'hello'} => string
 * {name: 'test', coord: {x: 1, y: 1}} => string | {x: number, y: number}
 */
type TypeOfObjectPropRec<T, U extends keyof T = keyof T> = U extends string
  ? T[U] extends string | number | symbol
    ? T[U] // If it is a primitive, return the property type
    : T[U] extends Map<unknown, unknown>
    ? never // If it is a map, do not return the property type
    : T[U] extends Array<unknown>
    ? T[U]
    : T[U] extends (...args: unknown[]) => unknown
    ? never // If it is a function, do not return the property type
    : T[U] extends object
    ? T[U] | TypeOfObjectPropRec<T[U]>
    : T[U]
  : never;

type DatabaseTables =
  | 'Planet'
  | 'Affiliation'
  | 'PlanetAffiliationAge'
  | 'PlanetTag'
  | 'PlanetWithTagsView';

export type ForcefullyOmit<T, K extends keyof T> = Omit<T, K> &
  Partial<Record<K, never>>;

export type OnlyFirst<F, S> = F & { [Key in keyof Omit<S, keyof F>]?: never };

export {
  Icon,
  ObjectWithKeys,
  TypeOfObjectPropRec,
  ObjectPropsRec,
  ArrayObjType,
  ArrayPropPath,
  DatabaseTables
};
