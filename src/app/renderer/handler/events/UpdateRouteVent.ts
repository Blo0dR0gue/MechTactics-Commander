import { Planet } from '../../models/Planet';

interface UpdateRouteEvent {
  planet?: Planet;
  add?: boolean;
  calculate?: boolean;
  numberPlanets?: number;
}
export { UpdateRouteEvent };
