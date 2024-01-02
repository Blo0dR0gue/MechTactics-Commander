import { PlanetCoordData, PlanetData } from '../../types/PlanetData';

function createSVGElementFromString(svg: string) {
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

export {
  createSVGElementFromString,
  planetDataToPlanetCoordData,
  planetCoordDataToPlanetData,
};
