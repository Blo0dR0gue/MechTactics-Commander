function createSVGElementFromString(svg: string) {
  const svgCode = svg;

  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgCode, 'image/svg+xml');

  return svgDocument.documentElement as HTMLElement & SVGElement;
}

export { createSVGElementFromString };
