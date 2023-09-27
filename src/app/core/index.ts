import { ActionBarHandler } from './models/map/ActionBarHandler';
import { Universe } from './models/map/Universe';

const canvasElement = document.getElementById('universe') as HTMLCanvasElement;

const universe = new Universe(canvasElement);
const actionBarHandler = new ActionBarHandler();

universe.init();
actionBarHandler.init();
