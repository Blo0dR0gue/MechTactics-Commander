import { CameraController } from '../controller/CameraController';
import { Planet } from '../models/Planet';
import { SelectionChangeEvent } from './events/SelectionChangedEvent';

class ActionBarHandler {
  private navButtons: NodeListOf<HTMLDivElement>;
  private contentArea: HTMLDivElement;

  private planetNameArea: HTMLElement;
  private affiliationNameArea: HTMLElement;
  private wikiLinkArea: HTMLLinkElement;

  private selectedPlanet: Planet | null;

  public constructor() {
    this.navButtons = document.querySelectorAll('.btn-actionBar');
    this.contentArea = document.getElementById('content-box') as HTMLDivElement;
    this.planetNameArea = document.getElementById('planet-name');
    this.affiliationNameArea = document.getElementById('affiliation-name');
    this.wikiLinkArea = document.getElementById('wiki-link') as HTMLLinkElement;
  }

  public init(camera: CameraController) {
    this.navButtons.forEach((element) => {
      if (element.id === undefined || element.dataset.content === undefined)
        return;
      element.addEventListener(
        'click',
        function () {
          this.showTab(element.dataset.content);
        }.bind(this)
      );
    });

    camera.selectionChangeEvent.subscribe(this.planetChanged.bind(this));
  }

  private planetChanged(planetChanged: SelectionChangeEvent) {
    this.selectedPlanet = planetChanged.planet;
    // TODO: simplify
    if (this.selectedPlanet === null) {
      this.updateText(this.planetNameArea, 'None');
      this.updateText(this.affiliationNameArea, 'None');
      this.wikiLinkArea.href = '#';
    } else {
      this.updateText(this.planetNameArea, this.selectedPlanet.getName());
      this.updateText(
        this.affiliationNameArea,
        this.selectedPlanet.getAffiliationName()
      );
      // TODO: Open in new window on click
      this.wikiLinkArea.href = this.selectedPlanet.getWikiURL();
    }
  }

  private showTab(tabName) {
    // Hide all tab contents
    const tabContents = this.contentArea
      .children as HTMLCollectionOf<HTMLDivElement>;
    for (let i = 0; i < tabContents.length; i++) {
      tabContents[i].classList.add('hide');
    }

    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab === null) return;
    selectedTab.classList.remove('hide');
  }

  private updateText(element: HTMLElement, text: string) {
    element.textContent = text;
  }
}

export { ActionBarHandler };
