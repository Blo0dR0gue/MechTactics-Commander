import { Modal } from 'bootstrap';
import { CameraController } from '@renderer/map/controller/CameraController';
import { Universe } from '../ui/Universe';
import { ToastHandler, ToastType } from '../utils/components/ToastHandler';

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
  private cameraController!: CameraController;

  /**
   * The active camera
   */
  private universe!: Universe;

  /**
   * The toast handler
   */
  private toastHandler!: ToastHandler;

  /**
   * Creates a new HeaderHandler
   */
  public constructor() {
    // Create Modal
    this.disclaimer = document.getElementById('disclaimer') as HTMLDivElement;
    this.disclaimerModal = new Modal(document.getElementById('disclaimer-modal') as HTMLDivElement, {
      backdrop: true,
      keyboard: false,
      focus: true
    });

    // Get search bar
    this.searchBar = document.getElementById('planet-search') as HTMLInputElement;
  }

  /**
   * Init the handler
   */
  public init(cameraController: CameraController, universe: Universe, toastHandler: ToastHandler): void {
    this.cameraController = cameraController;
    this.universe = universe;
    this.toastHandler = toastHandler;

    this.setupUniverseAgeSelectionDropdown();

    // Add click listener to show the disclaimer modal
    this.disclaimer.addEventListener('click', this.showDisclaimer.bind(this));

    // Add change listener to searchbar
    this.searchBar.addEventListener('keydown', this.onSearchTriggered.bind(this));
  }

  private setupUniverseAgeSelectionDropdown(): void {
    const selectedVersionVisual = document.getElementById('selected-universe-age') as HTMLSpanElement;

    selectedVersionVisual.textContent = this.universe.getSelectedUniverseAge().toString();

    const dropDownContainer = document.getElementById('age-dropdown-menu') as HTMLDivElement;
    const ages = this.universe.getAvailableUniverseAges();

    for (const age of ages) {
      const ageElement = document.createElement('a');
      ageElement.href = '#';
      ageElement.textContent = age.toString();
      ageElement.dataset.value = age.toString();
      ageElement.classList.add('dropdown-item');
      ageElement.addEventListener('click', () => {
        if (ageElement.dataset.value) {
          selectedVersionVisual.textContent = ageElement.dataset.value;
        }
        this.universe.setSelectedUniverseAge(age);
      });
      dropDownContainer.appendChild(ageElement);
    }
  }

  /**
   * Helper to show the disclaimer modal.
   */
  private showDisclaimer(): void {
    this.disclaimerModal.show();
  }

  private onSearchTriggered(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return; // Trigger only on enter
    const search = this.searchBar.value;
    if (search.length < 3) return;
    const planet = this.universe.getGetPlanetByName(search);
    this.universe.focus();
    if (planet === undefined) {
      this.toastHandler.createAndShowToast('Search', `Planet <b>${search}</b> not found`, ToastType.Warning);
      return;
    }
    this.cameraController.centerOnPlanetAndSelect(planet);
  }
}

export { HeaderHandler };
