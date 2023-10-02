import { Vector } from '../../../app/renderer/models/Vector';

describe('Vector', () => {
  test.each([
    [0, 0],
    [1, 1],
    [-1, -1],
    [3, -4],
    [-2, 7],
  ])('constructor initializes x and y values (%p, %p)', (x, y) => {
    const vector = new Vector(x, y);
    expect(vector.getX()).toBe(x);
    expect(vector.getY()).toBe(y);
  });

  test.each([
    [2, 3, 3.60555],
    [0, 0, 0],
    [1, 0, 1],
    [3, -4, 5],
    [-2, 7, 7.280109889280518],
  ])(
    'length() calculates the correct length for vector (%p, %p)',
    (x, y, expectedLength) => {
      const vector = new Vector(x, y);
      expect(vector.length()).toBeCloseTo(expectedLength);
    }
  );

  test.each([
    [2, 3, 2, 3, 0],
    [0, 0, 1, 1, 1.4142],
    [1, 0, -3, 4, 5.6568],
    [3, -4, -2, 7, 12.08],
  ])(
    'distance() calculates the correct distance between vectors (%p, %p) and (%p, %p)',
    (x1, y1, x2, y2, expectedDistance) => {
      const vector1 = new Vector(x1, y1);
      const vector2 = new Vector(x2, y2);
      expect(vector1.distance(vector2)).toBeCloseTo(expectedDistance);
    }
  );

  test.each([[2], [0], [1], [-3]])(
    'setX() sets the x-coordinate correctly (%p)',
    (x) => {
      const vector = new Vector(0, 0);
      vector.setX(x);
      expect(vector.getX()).toBe(x);
    }
  );

  test.each([[2], [0], [1], [-3]])(
    'setY() sets the y-coordinate correctly (%p)',
    (y) => {
      const vector = new Vector(0, 0);
      vector.setY(y);
      expect(vector.getY()).toBe(y);
    }
  );

  test.each([
    [2, 3, 4, 5],
    [0, 0, 1, 1],
    [1, 0, -1, -1],
    [-3, 4, -2, -7],
  ])(
    'set() sets both x and y coordinates correctly (%p, %p)',
    (x, y, newX, newY) => {
      const vector = new Vector(x, y);
      vector.set(newX, newY);
      expect(vector.getX()).toBe(newX);
      expect(vector.getY()).toBe(newY);
    }
  );

  test.each([
    [2, 3, 13],
    [0, 0, 0],
    [1, 0, 1],
    [-3, 4, 25],
    [-2, -7, 53],
  ])(
    'lengthSqrt() calculates the correct squared length for vector (%p, %p)',
    (x, y, expectedLengthSqrt) => {
      const vector = new Vector(x, y);
      expect(vector.lengthSqrt()).toBe(expectedLengthSqrt);
    }
  );
});
