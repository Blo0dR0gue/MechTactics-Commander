import { Modal } from 'bootstrap';

class HeaderHandler {
  private searchBar: HTMLInputElement;

  // Disclaimer
  private disclaimer: HTMLDivElement;
  private disclaimerModal: Modal;

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

  public init() {
    // Add click listener to show the disclaimer modal
    this.disclaimer.addEventListener('click', this.showDisclaimer.bind(this));
  }

  /**
   * Helper to show the disclaimer modal.
   */
  private showDisclaimer() {
    this.disclaimerModal.show();
  }
}

export { HeaderHandler };
