import { Vector } from '../../../../app/core/models/map/Vector';

describe('Vector module', () => {
  test('Construct Vector object with x=10 and y=10', () => {
    const vector = new Vector(10, 10);
    expect(vector).not.toBeUndefined();
    expect(vector.getX()).toBe(10);
    expect(vector.getY()).toBe(10);
  });
});
