import { Modal } from 'bootstrap';
import { CameraController } from '../controller/CameraController';
import { Universe } from '../ui/Universe';

/**
 * Responsible for handling the header elements
 */
class HeaderHandler {
  /**
   * Searchbar element
   */
  private searchBar: HTMLInputElement;

  /**
   * Disclaimer trigger button
   */
  private disclaimer: HTMLDivElement;
  /**
   * The modal
   */
  private disclaimerModal: Modal;

  /**
   * The active camera
   */
  private cameraController: CameraController;

  /**
   * The active camera
   */
  private universe: Universe;

  /**
   * Creates a new HeaderHandler
   */
  public constructor() {
    // Create Modal
    this.disclaimer = document.getElementById('disclaimer') as HTMLDivElement;
    this.disclaimerModal = new Modal(
      document.getElementById('disclaimer-modal'),
      {
        backdrop: true,
        keyboard: false,
        focus: true,
      }
    );

    // Get search bar
    this.searchBar = document.getElementById(
      'planet-search'
    ) as HTMLInputElement;
  }

  /**
   * Init the handler
   */
  public init(cameraController: CameraController, universe: Universe) {
    this.cameraController = cameraController;
    this.universe = universe;

    // Add click listener to show the disclaimer modal
    this.disclaimer.addEventListener('click', this.showDisclaimer.bind(this));

    // Add change listener to searchbar
    this.searchBar.addEventListener(
      'keydown',
      this.onSearchTriggered.bind(this)
    );
  }

  /**
   * Helper to show the disclaimer modal.
   */
  private showDisclaimer() {
    this.disclaimerModal.show();
  }

  private onSearchTriggered(event: KeyboardEvent) {
    if (event.key !== 'Enter') return; // Trigger only on enter
    const search = this.searchBar.value;
    if (search.length < 3) return;
    const planet = this.universe.getGetPlanetByName(search);
    if (planet === undefined) return;
    this.cameraController.centerOnPlanetAndSelect(planet);
    this.universe.focus();
  }
}

export { HeaderHandler };
