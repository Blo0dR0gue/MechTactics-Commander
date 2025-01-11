import { PlanetCoordData, PlanetData } from '../../types/PlanetData';

function createSVGElementFromString(svg: string): HTMLElement & SVGElement {
  const svgCode = svg;

  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgCode, 'image/svg+xml');

  return svgDocument.documentElement as HTMLElement & SVGElement;
}

/**
 * Moves x and y coordinate to separate object
 * @param planet
 * @returns
 */
function planetDataToPlanetCoordData(planet: PlanetData): PlanetCoordData {
  const { x, y, ...rest } = planet;
  return { ...rest, coord: { x: x, y: y } } as PlanetCoordData;
}

function planetCoordDataToPlanetData(planet: PlanetCoordData): PlanetData {
  const { coord, ...rest } = planet;
  return { ...rest, x: coord.x, y: coord.y } as PlanetData;
}

function escapeHtmlTags(input: string): string {
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Get the deepest object of the path.
 *
 * @param {object} obj - The object to check for the path.
 * @param {string} propPath - The path where each part is separated with a '.'.
 *
 * @throws {Error}
 *
 * @returns {object} The deepest object.
 */
function getDeepestObjectForPath(obj: object, propPath: string): object {
  const path = propPath.split('.');
  if (path.length < 1) {
    throw new Error(`Invalid property path: ${propPath}`);
  }
  path.pop(); // Remove the last element
  let current = obj;

  for (const part of path) {
    if (current[part] === undefined) {
      throw new Error(`Object does not have property: ${part}`);
    }
    current = current[part];
  }

  return current;
}

/**
 * Get the last part of the path.
 *
 * @param {string} propPath - The path where each part is separated with a '.'.
 *
 * @throws {Error}
 *
 * @returns {string} The last part of the path.
 */
function getLastPathPart(propPath: string): string {
  const path = propPath.split('.');
  const last = path.pop();
  if (last === undefined) {
    throw new Error(`Path "${propPath}" is not correctly formatted.`);
  }
  return last;
}

export {
  createSVGElementFromString,
  planetDataToPlanetCoordData,
  planetCoordDataToPlanetData,
  escapeHtmlTags,
  getDeepestObjectForPath,
  getLastPathPart,
};
