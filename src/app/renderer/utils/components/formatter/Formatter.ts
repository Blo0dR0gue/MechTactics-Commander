export interface Formatter<Target, Destination> {
  parse(value: Destination): Target;

  format(value: Target): Destination;
}
