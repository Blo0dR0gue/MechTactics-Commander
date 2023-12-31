import { PlanetRequest, PlanetResponse } from '../../types/PlanetData';

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
function planetResponseToPlanetRequest(planet: PlanetResponse): PlanetRequest {
  const { x, y, ...rest } = planet;
  return { ...rest, coordinates: { x: x, y: y } } as PlanetRequest;
}

export { createSVGElementFromString, planetResponseToPlanetRequest };
