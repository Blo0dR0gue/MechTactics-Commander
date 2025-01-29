import { CameraController } from '../controller/CameraController';
import { Planet } from '../models/Planet';
import { SelectionChangeEvent } from './events/SelectionChangedEvent';
import { UpdateRouteEvent } from './events/UpdateRouteEvent';
import { RouteController, RoutePoint } from '../controller/RouteController';
import { ToastHandler } from '../utils/components/ToastHandler';
import { Config } from '../utils/Config';
import { Universe } from '../ui/Universe';
import { Affiliation } from '../models/Affiliation';
import { PlanetTagGroup } from '../utils/components/PlanetTagGroup';
import { snakeCaseToTitleCase } from '../utils/Utils';

/**
 * Responsible for the action bar
 */
class ActionBarHandler {
  private navButtons: NodeListOf<HTMLDivElement>;
  private contentArea: HTMLDivElement;
  private routeItemsContainer: HTMLElement;

  private planetNameArea: HTMLElement;
  private affiliationNameArea: HTMLElement;
  private wikiLinkArea: HTMLLinkElement;
  private coordinatesArea: HTMLElement;
  private centerOnPlanetBtn: HTMLButtonElement;
  private addToRouteBtn: HTMLButtonElement;
  private planetCustomText: HTMLTextAreaElement;
  private planetTagContainer: HTMLDivElement;
  private planetInfoText: HTMLTextAreaElement;
  private planetTypeArea: HTMLDivElement;
  private planetPopulationArea: HTMLDivElement;
  private planetCivilizationArea: HTMLDivElement;
  private planetSizeArea: HTMLDivElement;
  private planetFuelingStationArea: HTMLDivElement;
  private noRoutingDataText: HTMLDivElement;

  private selectedPlanet: Planet | null;

  // Settings
  private settingsRange30: HTMLInputElement;
  private settingsRange60: HTMLInputElement;
  private excludedAffiliationsParent: HTMLElement;
  private settingsBackgroundColor: HTMLInputElement;

  // TODO: Rework (remove here)
  private routeController: RouteController;
  private cameraController: CameraController;
  private toastHandler: ToastHandler;
  private universe: Universe;

  private allowedJumpRanges = [30, 60];

  /**
   * Setup of all dom element references
   */
  public constructor() {
    this.navButtons = document.querySelectorAll('.btn-actionBar');
    this.contentArea = document.getElementById('content-box') as HTMLDivElement;
    this.routeItemsContainer = document.getElementById('route-container');
    this.planetNameArea = document.getElementById('planet-name');
    this.affiliationNameArea = document.getElementById('affiliation-name');
    this.wikiLinkArea = document.getElementById('wiki-link') as HTMLLinkElement;
    this.planetCustomText = document.getElementById(
      'planet-custom-textarea'
    ) as HTMLTextAreaElement;
    this.coordinatesArea = document.getElementById('coordinates');
    this.centerOnPlanetBtn = document.getElementById(
      'center-on-planet'
    ) as HTMLButtonElement;
    this.addToRouteBtn = document.getElementById(
      'add-to-route'
    ) as HTMLButtonElement;
    this.planetTagContainer = document.getElementById(
      'planet-tag-container'
    ) as HTMLDivElement;
    this.planetInfoText = document.getElementById(
      'planet-info-text'
    ) as HTMLTextAreaElement;
    this.planetTypeArea = document.getElementById(
      'planet-type'
    ) as HTMLDivElement;
    this.planetPopulationArea = document.getElementById(
      'planet-population'
    ) as HTMLDivElement;
    this.planetCivilizationArea = document.getElementById(
      'planet-civilization'
    ) as HTMLDivElement;
    this.planetSizeArea = document.getElementById(
      'planet-size'
    ) as HTMLDivElement;
    this.planetFuelingStationArea = document.getElementById(
      'planet-fueling-station'
    ) as HTMLDivElement;

    this.noRoutingDataText = document.getElementById(
      'no-routing-data-text'
    ) as HTMLDivElement;

    // Settings Elements
    this.settingsRange30 = document.getElementById(
      'settings-range-30'
    ) as HTMLInputElement;
    this.settingsRange60 = document.getElementById(
      'settings-range-60'
    ) as HTMLInputElement;
    this.excludedAffiliationsParent = document.getElementById(
      'jump-settings-excluded-affiliations'
    );
    this.settingsBackgroundColor = document.getElementById(
      'settings-background-color'
    ) as HTMLInputElement;
  }

  /**
   * Init the handler
   *
   * @param cameraController The camera controller, to use for center
   */
  public init(
    cameraController: CameraController,
    toastHandler: ToastHandler,
    universe: Universe,
    routeController: RouteController
  ) {
    this.toastHandler = toastHandler;
    this.cameraController = cameraController;
    this.universe = universe;
    this.routeController = routeController;

    // Add a click listener to all navigation buttons, to show the tagged tab in the navigation content area.
    // The element need a content data, tab with the id of the content to show inside the (Content-Area)!
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

    // Add a click listener to the button to center on the selected planet.
    this.centerOnPlanetBtn.addEventListener(
      'click',
      this.centerOnPlanetClicked.bind(this)
    );

    // Add a click listener to the button to add the selected planet to the route.
    this.addToRouteBtn.addEventListener(
      'click',
      this.addToRouteClicked.bind(this)
    );

    // Add listener to the custom text area changes to update the selected planets custom text
    this.planetCustomText.addEventListener('change', () => {
      if (this.selectedPlanet) {
        this.selectedPlanet.setCustomText(this.planetCustomText.value);
      }
    });

    // Setup the camera event listeners
    this.universe.planetSelectionChangedEvent.subscribe(
      this.planetSelectionChanged.bind(this)
    );
    this.routeController.updateRouteEvent.subscribe(
      this.routeChanged.bind(this)
    );

    this.setupSettingsTab();
  }

  private setupSettingsTab() {
    let jumpRange = Config.getInstance().get('jumpRange') as number;

    if (!this.allowedJumpRanges.includes(jumpRange)) {
      jumpRange = this.allowedJumpRanges[0];
      Config.getInstance().set('jumpRange', jumpRange);
    }

    if (jumpRange === 60) {
      this.settingsRange60.checked = true;
    } else {
      this.settingsRange30.checked = true;
    }

    this.settingsRange60.addEventListener('change', () => {
      Config.getInstance().set('jumpRange', 60);
      // TODO: Use Event???
      this.generateJumpCards();
    });
    this.settingsRange30.addEventListener('change', () => {
      Config.getInstance().set('jumpRange', 30);
      // TODO: Use Event???
      this.generateJumpCards();
    });

    this.settingsBackgroundColor.value = this.universe.getBackgroundColor();

    this.settingsBackgroundColor.addEventListener('change', (event) => {
      this.universe.setBackgroundColor(
        (event.target as HTMLInputElement).value
      );
    });

    // Setup exclude affiliations toggles
    const rowParent = this.excludedAffiliationsParent.children[0];
    const col1 = rowParent.children[0];
    const col2 = rowParent.children[1];

    // Get Affiliations to exclude
    // TODO: Rework to make it more dynamic (Add others - add to dashboard in next version)
    const sepExcluded = [] as Affiliation[];
    // Max 4 elements per col
    const perCol = 4;

    sepExcluded.push(
      this.universe.getAffiliationWithName('Capellan Confederation')
    );
    sepExcluded.push(this.universe.getAffiliationWithName('Draconis Combine'));
    sepExcluded.push(this.universe.getAffiliationWithName('Federated Suns'));
    sepExcluded.push(
      this.universe.getAffiliationWithName('Free Worlds League')
    );
    sepExcluded.push(
      this.universe.getAffiliationWithName('Lyran Commonwealth')
    );
    sepExcluded.push(this.universe.getAffiliationWithName('No record'));
    sepExcluded.push(this.universe.getAffiliationWithName('Inhabited system'));

    const excludedAffiliationIDs =
      (Config.getInstance().get('excludedAffiliationIDs') as number[]) || [];

    for (let i = 0; i < sepExcluded.length; i++) {
      // Only allow 2 cols with each perCol elements
      if (i >= perCol * 2) break;
      const affiliation = sepExcluded[i];
      const col = i < perCol ? col1 : col2;
      if (affiliation) {
        col.appendChild(
          this.createExcludeAffiliationToggle(
            affiliation.getName(),
            !excludedAffiliationIDs.includes(affiliation.getID()),
            (input: HTMLInputElement) => {
              if (input.checked) {
                Config.getInstance().remove(
                  'excludedAffiliationIDs',
                  affiliation.getID()
                );
                this.routeController.removeExcludedAffiliation(affiliation);
              } else {
                Config.getInstance().add(
                  'excludedAffiliationIDs',
                  affiliation.getID()
                );
                this.routeController.addExcludedAffiliation(affiliation);
              }
              this.generateJumpCards();
            }
          )
        );
      }
    }
  }

  /**
   * Handler to center the camera on the selected planet on button click.
   */
  private centerOnPlanetClicked() {
    if (this.selectedPlanet != null) {
      this.cameraController.centerOnPlanet(this.selectedPlanet);
    }
  }

  /**
   * Handler to add the selected planet to the route on button click.
   */
  private addToRouteClicked() {
    // Add to route only, iff a planet is selected.
    if (this.selectedPlanet != null) {
      this.routeController.addTargetPlanet(this.selectedPlanet);
    }
  }
  /**
   * Listener function, which is called, if the camera selects a other planet!
   *
   * @param planetChanged The event data
   */
  private planetSelectionChanged(planetChanged: SelectionChangeEvent) {
    this.selectedPlanet = planetChanged.planet;
    // TODO: simplify
    if (this.selectedPlanet === null) {
      this.updateText(this.planetNameArea, 'None');
      this.updateText(this.affiliationNameArea, 'None');
      this.updateText(this.coordinatesArea, `x: None, y: None`);
      this.wikiLinkArea.href = '#';
      this.planetCustomText.disabled = true;
      this.planetCustomText.value = '';
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

      this.wikiLinkArea.href =
        this.selectedPlanet.getWikiURL() ||
        'https://www.sarna.net/wiki/Main_Page';
      this.planetCustomText.disabled = false;
      this.planetCustomText.value = this.selectedPlanet.getCustomText();
      // Select first button (Planet Details)
      // FIXME: Make dynamic
      this.showTab(this.navButtons[0].dataset.content, this.navButtons[0]);
    }

    this.updatePlanetTagVisual(this.selectedPlanet);
    this.updateText(this.planetTypeArea, this.selectedPlanet?.getType() ?? 'X');
    this.planetInfoText.value = this.selectedPlanet?.getDetail() ?? '';
    this.updateText(
      this.planetCivilizationArea,
      this.selectedPlanet?.getCivilization() ?? 'None'
    );
    this.updateText(
      this.planetFuelingStationArea,
      this.selectedPlanet?.hasFuelingStation() ? 'true' : 'false'
    ),
      this.updateText(
        this.planetSizeArea,
        this.selectedPlanet?.getSize() ?? 'Unknown'
      );
    this.updateText(
      this.planetPopulationArea,
      this.selectedPlanet?.getPopulation() ?? 'None'
    );
  }

  /**
   * Listener function, which is called, if a planet is added to the route (via event).
   *
   * @param routeChanged The event data
   */
  private routeChanged(routeChanged: UpdateRouteEvent) {
    if (routeChanged.planet !== undefined && routeChanged.add) {
      // Create the planet card in the routing area and add it to it.
      this.createRoutePlanetCard(routeChanged.planet);
      if (routeChanged.numberPlanets > 1) {
        // Iff we have more then 1 planet in the target planets, also generate the jump cards to display how many jumps are needed.
        this.generateJumpCards();
      }
      this.toastHandler.createAndShowToast(
        'Route',
        `Added ${routeChanged.planet.getName()} to route.`
      );
    }
    if (routeChanged?.numberPlanets > 0) {
      this.noRoutingDataText.style.setProperty('display', 'none', 'important');
    } else {
      this.noRoutingDataText.style.removeProperty('display');
    }
  }

  /**
   * Helper function, to enable a specific content in the action bar content are. The others are getting disabled
   *
   * @param tabName The tab to show
   * @param button The button, which got clicked
   */
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

  /**
   * Helper function to update the text of an DOM-element
   *
   * @param element The element to update
   * @param text The new text
   */
  private updateText(element: HTMLElement, text: string) {
    element.textContent = text;
  }

  /**
   * Function, to generate all jump cards. It removes all first, calculates the route to all planets and added the jump cards between the corresponding planet cards.
   */
  private generateJumpCards(): void {
    const routeGenerated = this.routeController.calculateRoute(
      Config.getInstance().get('jumpRange') as number
    );

    const route = this.routeController.getRoute();

    // Remove all existing jump cards
    const jumpCards = document.querySelectorAll('[data-jump-card]');
    jumpCards.forEach((card) => {
      card.remove();
    });

    if (!routeGenerated) {
      // Clear the route, if no route got generated
      this.routeController.clearRoute();
      return;
    }

    // Get all planet cards
    const planetCards = document.querySelectorAll('[data-planet-card]');
    let i = 0;
    let nextPlanetCard = planetCards[i];

    // Add all jump cards between the planet cards
    route.forEach((routePoint) => {
      const card = this.createRouteJumpCard(routePoint);
      this.routeItemsContainer.insertBefore(card, nextPlanetCard.nextSibling);
      nextPlanetCard = planetCards[++i];
    });
  }

  /**
   * Cheats a new planet card and adds it to the content area.
   *
   * @param planet The planet to add.
   */
  private createRoutePlanetCard(planet: Planet) {
    const cardDiv = document.createElement('div');
    cardDiv.className =
      'card text-white my-auto flex-shrink-0 bg-dark min-w-200 p-2';
    cardDiv.dataset.planetCard = planet.getName();

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.className = 'card-body p-2';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title text-center';
    cardTitle.textContent = planet.getName();

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm ms-1';
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
    centerButton.className = 'btn btn-info btn-sm ms-1';
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

  /**
   * Helper function to create a new jump card
   *
   * @param jumps The amount of jumps
   * @returns The dom jump card element
   */
  private createRouteJumpCard(routePoint: RoutePoint) {
    const cardDiv = document.createElement('div');
    cardDiv.className =
      'text-center my-auto d-flex flex-column align-items-center text-white mx-1';
    cardDiv.dataset.jumpCard = 'route-jump-card';

    const arrowDiv = document.createElement('div');
    arrowDiv.textContent = '→';

    const jumpsDiv = document.createElement('div');
    jumpsDiv.textContent = `${routePoint.jumps} Jumps`;

    cardDiv.appendChild(arrowDiv);
    cardDiv.appendChild(jumpsDiv);
    return cardDiv;
  }

  private createExcludeAffiliationToggle(
    name: string,
    checked: boolean,
    handler: (input: HTMLInputElement) => void
  ) {
    const parent = document.createElement('div');

    const input = document.createElement('input');
    input.classList.add('form-check-input');
    input.type = 'checkbox';
    input.role = 'switch';
    input.id = name + '-route-toggle';
    input.checked = checked;
    input.addEventListener('click', handler.bind(this, input));

    const label = document.createElement('label');
    label.classList.add('form-check-label');
    label.classList.add('text-white');
    label.htmlFor = input.id;
    label.textContent = name;

    parent.appendChild(input);
    parent.appendChild(label);

    return parent;
  }

  private updatePlanetTagVisual(selectedPlanet: Planet | null): void {
    this.planetTagContainer.innerHTML = '';

    if (selectedPlanet === null) {
      return;
    }

    selectedPlanet.getTags().forEach((tagValues, tagKey) => {
      new PlanetTagGroup({
        parentElement: this.planetTagContainer,
        tagTitle: snakeCaseToTitleCase(tagKey),
        tagValueList: tagValues
      }).render();
    });
  }
}

export { ActionBarHandler };
