import { Planet } from '../../../app/renderer/models/Planet';

describe.each([
  [
    {
      planetName: 'Earth',
      x: 0,
      y: 0,
      affiliationId: 1,
      link: 'https://example.com',
      nameAffiliation: 'Terran',
      color: 'blue',
    },
    'Earth',
    'blue',
    0,
    0,
  ],
  [
    {
      planetName: 'Mars',
      x: 10,
      y: 20,
      affiliationId: 2,
      link: 'https://example.com/mars',
      nameAffiliation: 'Martian',
      color: 'red',
    },
    'Mars',
    'red',
    10,
    20,
  ],
])(
  'Planet',
  (planetData, expectedName, expectedColor, expectedX, expectedY) => {
    test('should create a Planet instance', () => {
      const planet = new Planet(planetData);
      expect(planet).toBeInstanceOf(Planet);
    });

    test('should have the correct name', () => {
      const planet = new Planet(planetData);
      expect(planet.getName()).toBe(expectedName);
    });

    test('should have the correct color', () => {
      const planet = new Planet(planetData);
      expect(planet.getColor()).toBe(expectedColor);
    });

    test('should have the correct coordinates', () => {
      const planet = new Planet(planetData);
      expect(planet.coord.get()).toEqual({ x: expectedX, y: expectedY });
    });
  }
);
