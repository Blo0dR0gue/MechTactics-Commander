import { ActionBarHandler } from './handler/ActionBarHandler';
import { Universe } from './ui/Universe';
// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';
import { CameraController } from './controller/CameraController';

import { Tooltip } from 'bootstrap';
import { HeaderHandler } from './handler/HeaderHandler';
import { ToastHandler } from './handler/ToastHandler';
import { Config } from './utils/Config';

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
    // Setup the app
    const canvasElement = document.getElementById(
      'universe'
    ) as HTMLCanvasElement;

    const universe = new Universe(canvasElement);
    const camera = new CameraController();
    const actionBarHandler = new ActionBarHandler();
    const headerHandler = new HeaderHandler();
    const toastHandler = new ToastHandler();

    camera.init(universe);
    universe.init(camera);
    actionBarHandler.init(camera, toastHandler);
    headerHandler.init(camera, universe, toastHandler);
  });
