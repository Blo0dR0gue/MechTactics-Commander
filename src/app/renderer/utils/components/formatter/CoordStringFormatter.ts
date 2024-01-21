import { StringFormatter } from './StringFomratter';

class CoordStringFormatter
  implements StringFormatter<{ x: number; y: number }>
{
  parse(value: string): { x: number; y: number } {
    const split = value.split('/');
    return {
      x: Number(split[0].trim()),
      y: Number(split[1].trim()),
    };
  }
  format(value: { x: number; y: number }): string {
    return value.x + ' / ' + value.y;
  }
}

export { CoordStringFormatter };
