import { ActionBarHandler } from './handler/ActionBarHandler';
import { Universe } from './ui/Universe';
// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';
import { CameraController } from './controller/CameraController';

// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap';

const canvasElement = document.getElementById('universe') as HTMLCanvasElement;

const universe = new Universe(canvasElement);
const camera = new CameraController();
const actionBarHandler = new ActionBarHandler();

camera.init(universe);
universe.init(camera);
actionBarHandler.init(camera);
