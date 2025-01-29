import { Affiliation } from '../../../app/renderer/models/Affiliation';
import { Planet } from '../../../app/renderer/models/Planet';

describe.each([
  [
    {
      id: 0,
      name: 'Earth',
      x: 0,
      y: 0,
      affiliationId: 1,
      link: 'https://example.com',
      planetText: 'test',
      nameAffiliation: 'Terran',
      color: 'blue'
    },
    'Earth',
    'blue',
    0,
    0
  ],
  [
    {
      id: 1,
      name: 'Mars',
      x: 10,
      y: 20,
      affiliationId: 2,
      link: 'https://example.com/mars',
      planetText: 'test',
      nameAffiliation: 'Martian',
      color: 'red'
    },
    'Mars',
    'red',
    10,
    20
  ]
])(
  'Planet',
  (planetData, expectedName, expectedColor, expectedX, expectedY) => {
    test('should create a Planet instance', () => {
      const planet = new Planet({
        id: planetData.id,
        name: planetData.name,
        x: planetData.x,
        y: planetData.y,
        link: planetData.link,
        customText: planetData.planetText,
        affiliation: new Affiliation(
          planetData.affiliationId,
          planetData.nameAffiliation,
          planetData.color
        ),
        universeAge: 3025,
        tagObject: {},
        fuelingStation: false,
        detail: '',
        type: '',
        civilization: '',
        population: '',
        size: '',
        jumpDistance: 0
      });
      expect(planet).toBeInstanceOf(Planet);
    });

    test('should have the correct name', () => {
      const planet = new Planet({
        id: planetData.id,
        name: planetData.name,
        x: planetData.x,
        y: planetData.y,
        link: planetData.link,
        customText: planetData.planetText,
        affiliation: new Affiliation(
          planetData.affiliationId,
          planetData.nameAffiliation,
          planetData.color
        ),
        universeAge: 3025,
        tagObject: {},
        fuelingStation: false,
        detail: '',
        type: '',
        civilization: '',
        population: '',
        size: '',
        jumpDistance: 0
      });
      expect(planet.getName()).toBe(expectedName);
    });

    test('should have the correct color', () => {
      const planet = new Planet({
        id: planetData.id,
        name: planetData.name,
        x: planetData.x,
        y: planetData.y,
        link: planetData.link,
        customText: planetData.planetText,
        affiliation: new Affiliation(
          planetData.affiliationId,
          planetData.nameAffiliation,
          planetData.color
        ),
        universeAge: 3025,
        tagObject: {},
        fuelingStation: false,
        detail: '',
        type: '',
        civilization: '',
        population: '',
        size: '',
        jumpDistance: 0
      });
      expect(planet.getColor()).toBe(expectedColor);
    });

    test('should have the correct coordinates', () => {
      const planet = new Planet({
        id: planetData.id,
        name: planetData.name,
        x: planetData.x,
        y: planetData.y,
        link: planetData.link,
        customText: planetData.planetText,
        affiliation: new Affiliation(
          planetData.affiliationId,
          planetData.nameAffiliation,
          planetData.color
        ),
        universeAge: 3025,
        tagObject: {},
        fuelingStation: false,
        detail: '',
        type: '',
        civilization: '',
        population: '',
        size: '',
        jumpDistance: 0
      });
      expect(planet.coord.get()).toEqual({ x: expectedX, y: expectedY });
    });
  }
);
