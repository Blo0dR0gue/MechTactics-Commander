import { Upgrade008 } from './Upgrade008';
import { Upgrade009 } from './Upgrade009';
import { Upgrade010 } from './Upgrade010';
import { Upgrade011 } from './Upgrade011';
import { Upgrade012 } from './Upgrade012';
import { Upgrade013 } from './Upgrade013';

// TODO Use class instead which creates the upgrade objects
export default {
  '0.0.8': Upgrade008,
  '0.0.9': Upgrade009,
  '0.1.0': Upgrade010,
  '0.1.1': Upgrade011,
  '0.1.2': Upgrade012,
  '0.1.3': Upgrade013,
};
