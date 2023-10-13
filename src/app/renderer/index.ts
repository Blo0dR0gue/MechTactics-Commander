import { ActionBarHandler } from './handler/ActionBarHandler';
import { Universe } from './ui/Universe';
// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';
import { CameraController } from './controller/CameraController';

import { Tooltip } from 'bootstrap';
import { HeaderHandler } from './handler/HeaderHandler';
import { ToastHandler } from './handler/ToastHandler';
import { Config } from './utils/Config';
import { RouteController } from './controller/RouteController';

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
    // Setup the app elements
    const universe = new Universe();
    const camera = new CameraController();
    const actionBarHandler = new ActionBarHandler();
    const headerHandler = new HeaderHandler();
    const toastHandler = new ToastHandler();
    const routeController = new RouteController();

    // Universe is the central element and needs to generate before the others can start
    universe.init(camera, routeController).then(() => {
      // Start the camera controller & the handlers
      camera.init(universe, routeController);
      routeController.init(universe);
      actionBarHandler.init(camera, toastHandler, universe, routeController);
      headerHandler.init(camera, universe, toastHandler);
    });
  });
