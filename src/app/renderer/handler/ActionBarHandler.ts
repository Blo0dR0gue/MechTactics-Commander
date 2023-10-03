import { CameraController } from '../controller/CameraController';
import { Planet } from '../models/Planet';
import { SelectionChangeEvent } from './events/SelectionChangedEvent';
import { Modal } from 'bootstrap';
import { UpdateRouteEvent } from './events/UpdateRouteVent';
import { RouteController } from '../controller/RouteController';

class ActionBarHandler {
  private navButtons: NodeListOf<HTMLDivElement>;
  private contentArea: HTMLDivElement;
  private routeItemsContainer: HTMLElement;

  private planetNameArea: HTMLElement;
  private affiliationNameArea: HTMLElement;
  private wikiLinkArea: HTMLLinkElement;
  private coordinatesArea: HTMLElement;
  private centerOnPlanetBtn: HTMLButtonElement;

  // TODO: Move to index???
  private disclaimer: HTMLDivElement;
  private disclaimerModal: Modal;

  private selectedPlanet: Planet | null;

  // TODO: Rework (remove here)
  private routeController: RouteController;
  private cameraController: CameraController;

  public constructor() {
    this.navButtons = document.querySelectorAll('.btn-actionBar');
    this.contentArea = document.getElementById('content-box') as HTMLDivElement;
    this.routeItemsContainer = document.getElementById('route-container');
    this.planetNameArea = document.getElementById('planet-name');
    this.affiliationNameArea = document.getElementById('affiliation-name');
    this.wikiLinkArea = document.getElementById('wiki-link') as HTMLLinkElement;
    this.coordinatesArea = document.getElementById('coordinates');
    this.centerOnPlanetBtn = document.getElementById(
      'centerOnPlanet'
    ) as HTMLButtonElement;

    this.disclaimer = document.getElementById('disclaimer') as HTMLDivElement;
    this.disclaimerModal = new Modal(
      document.getElementById('disclaimer-modal'),
      {
        backdrop: true,
        keyboard: false,
        focus: true,
      }
    );
  }

  public init(camera: CameraController) {
    this.navButtons.forEach((element) => {
      if (element.id === undefined || element.dataset.content === undefined)
        return;
      element.addEventListener(
        'click',
        function () {
          this.showTab(element.dataset.content, element);
        }.bind(this)
      );
    });

    this.centerOnPlanetBtn.addEventListener(
      'click',
      this.centerOnPlanetClicked.bind(this)
    );

    this.disclaimer.addEventListener('click', this.showDisclaimer.bind(this));
    this.cameraController = camera;

    this.cameraController.selectionChangeEvent.subscribe(
      this.planetSelectionChanged.bind(this)
    );
    this.cameraController.updateRouteEvent.subscribe(
      this.routeChanged.bind(this)
    );
    this.routeController = camera.getRouteManager();
  }

  private centerOnPlanetClicked() {
    if (this.selectedPlanet !== null) {
      this.cameraController.centerOnPlanet(this.selectedPlanet);
    }
  }

  private showDisclaimer() {
    this.disclaimerModal.show();
  }

  private planetSelectionChanged(planetChanged: SelectionChangeEvent) {
    this.selectedPlanet = planetChanged.planet;
    // TODO: simplify
    if (this.selectedPlanet === null) {
      this.updateText(this.planetNameArea, 'None');
      this.updateText(this.affiliationNameArea, 'None');
      this.updateText(this.coordinatesArea, `x: None, y: None`);
      this.wikiLinkArea.href = '#';
    } else {
      this.updateText(this.planetNameArea, this.selectedPlanet.getName());
      this.updateText(
        this.affiliationNameArea,
        this.selectedPlanet.getAffiliationName()
      );
      this.updateText(
        this.coordinatesArea,
        `x: ${this.selectedPlanet.coord.getX()}, y: ${this.selectedPlanet.coord.getY()}`
      );
      // TODO: Open in new window on click
      this.wikiLinkArea.href = this.selectedPlanet.getWikiURL();
    }
  }

  private routeChanged(routeChanged: UpdateRouteEvent) {
    if (routeChanged.planet !== undefined && routeChanged.add) {
      this.createRoutePlanetCard(routeChanged.planet);
      if (routeChanged.numberPlanets > 1) {
        this.generateJumpCards();
      }
    }
  }

  private showTab(tabName, button) {
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

    this.navButtons.forEach((element) => {
      if (element === button) {
        element.classList.add('bg-selected');
      } else {
        element.classList.remove('bg-selected');
      }
    });
  }

  private updateText(element: HTMLElement, text: string) {
    element.textContent = text;
  }

  private generateJumpCards(): void {
    // TODO: Rework that. Only for first function tests!
    const routeGenerated = this.routeController.calculateRoute(30);

    const jumps = this.routeController.getNumberOfJumpsBetween();
    // Remove all existing jump cards
    const jumpCards = document.querySelectorAll('[data-jump-card]');
    jumpCards.forEach((card) => {
      card.remove();
    });

    if (!routeGenerated) {
      this.routeController.clearRoute();
      return;
    }

    const planetCards = document.querySelectorAll('[data-planet-card]');
    let i = 0;
    let nextPlanetCard = planetCards[i];

    jumps.forEach((jump) => {
      const card = this.createRouteJumpCard(jump);
      this.routeItemsContainer.insertBefore(card, nextPlanetCard.nextSibling);
      nextPlanetCard = planetCards[++i];
    });
  }

  private createRoutePlanetCard(planet: Planet) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card text-white my-auto flex-shrink-0';
    cardDiv.style.width = '200px';
    cardDiv.dataset.planetCard = planet.getName();

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.className = 'card-body p-2';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title text-center';
    cardTitle.textContent = planet.getName();

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'x';
    deleteButton.onclick = () => {
      this.routeController.removeTargetPlanetByName(cardDiv.dataset.planetCard);
      cardDiv.remove();
      this.generateJumpCards();
    };

    const cardText = document.createElement('p');
    cardText.className = 'card-text text-center';
    cardText.textContent = `${planet.coord.getX()} | ${planet.coord.getY()}`;

    const centerButton = document.createElement('button');
    centerButton.className = 'btn btn-info btn-sm';
    centerButton.textContent = 'o';
    centerButton.onclick = () => {
      this.cameraController.centerOnPlanetByName(cardDiv.dataset.planetCard);
    };

    // Append the elements to build the card
    cardTitle.appendChild(deleteButton);
    cardText.appendChild(centerButton);
    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(cardText);
    cardDiv.appendChild(cardBodyDiv);

    cardDiv.id = planet.getName() + '-route-card';
    this.routeItemsContainer.appendChild(cardDiv);
  }

  private createRouteJumpCard(jumps: number) {
    const cardDiv = document.createElement('div');
    cardDiv.className =
      'text-center my-auto d-flex flex-column align-items-center text-white';
    cardDiv.dataset.jumpCard = 'route-jump-card';

    const arrowDiv = document.createElement('div');
    arrowDiv.textContent = '→';

    const jumpsDiv = document.createElement('div');
    jumpsDiv.textContent = `${jumps} Jumps`;

    cardDiv.appendChild(arrowDiv);
    cardDiv.appendChild(jumpsDiv);
    return cardDiv;
  }
}

export { ActionBarHandler };
