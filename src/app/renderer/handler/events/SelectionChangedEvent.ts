import { Planet } from '../../models/Planet';

export interface SelectionChangeEvent {
  planet: Planet | null;
}
