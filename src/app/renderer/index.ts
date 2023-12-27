// Init file for the main app

// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';

import { CameraController } from './controller/CameraController';
import { RouteController } from './controller/RouteController';
import { ActionBarHandler } from './handler/ActionBarHandler';
import { HeaderHandler } from './handler/HeaderHandler';
import { ToastHandler } from './utils/ToastHandler';
import { Universe } from './ui/Universe';
import { Config } from './utils/Config';

import { Tooltip } from 'bootstrap';

const loader = document.getElementById('loader');

const toastContainer = document.getElementById('toast-container');

// Enable all Tooltips
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
[...tooltipTriggerList].map(
  (tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
);

// Add app version in title
async function setTitle() {
  const version = await window.app.version();
  document.title = document.title.concat(` ${version}`);
}
setTitle();
// Build cache then start app
Config.getInstance()
  .buildCache()
  .then(() => {
    loader.classList.add('hide');
    loader.classList.remove('d-flex');
    // Setup the app elements
    const universe = new Universe();
    const camera = new CameraController();
    const actionBarHandler = new ActionBarHandler();
    const headerHandler = new HeaderHandler();
    const toastHandler = new ToastHandler(toastContainer);
    const routeController = new RouteController();

    // Universe is the central element and needs to generate before the others can start
    universe.init(routeController).then(() => {
      // Start the camera controller & the handlers
      camera.init(universe, routeController);
      routeController.init(universe);
      actionBarHandler.init(camera, toastHandler, universe, routeController);
      headerHandler.init(camera, universe, toastHandler);
    });
  });
