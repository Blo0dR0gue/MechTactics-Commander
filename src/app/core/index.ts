import { ActionBarHandler } from './models/map/ActionBarHandler';
import { Universe } from './models/map/Universe';
// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';

// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap';

const canvasElement = document.getElementById('universe') as HTMLCanvasElement;

const universe = new Universe(canvasElement);
const actionBarHandler = new ActionBarHandler();

universe.init();
actionBarHandler.init();
