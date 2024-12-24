import { Planet } from '../../models/Planet';

export interface UpdateRouteEvent {
  planet?: Planet;
  add?: boolean;
  calculate?: boolean;
  numberPlanets?: number;
}
