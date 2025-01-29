// Init file for the dashboard page

// TODO: Update the dynamic modal to also hold forms
// TODO: Short this file
// TODO: Cleanup (PRIO!!!)

// Import custom CSS to load bootstrap and override variables
import { Modal } from 'bootstrap';
import './styles/main.scss';
import { Table } from './utils/components/table/Table';
import { planetDataToPlanetCoordData } from './utils/Utils';
import { ToastHandler, ToastType } from './utils/components/ToastHandler';
import { RingLoadingIndicator } from './utils/components/RingLoadingIndicator';
import { Dialog } from './utils/components/Dialog';
import { AffiliationData } from '../types/AffiliationData';
import { PlanetCoordData } from '../types/PlanetData';
import {
  DynamicPlanetAffiliationConnectData,
  PlanetAffiliationAgeData,
  PlanetAffiliationAgeWithNamesData
} from '../types/PlanetAffiliationAge';
import { TabGroup } from './utils/components/TabGroup';
import {
  addIcon,
  affiliationIcon,
  copyIcon,
  deleteIcon,
  downloadIcon,
  editIcon,
  planetAffiliationAgeIcon,
  planetIcon,
  uploadIcon
} from './utils/Icons';
import { CoordStringFormatter } from './utils/components/formatter/CoordStringFormatter';
import PlanetTagEditor from './utils/components/PlanetTagEditor';
import { Dropdown } from './utils/components/Dropdown';

// get planet and affiliation data
const affiliationsData: AffiliationData[] =
  await window.sql.getAllAffiliations();

const planetsData: PlanetCoordData[] = await window.sql
  .getAllPlanets()
  .then((data) => data.map((planet) => planetDataToPlanetCoordData(planet)));

// TODO: Remove mapping of the data with the names of the planet or affiliation. This is because the formatter on the table was to slow while searching. this needs to be optimized

const currentUsedUniverseAges = await window.sql.getAllUniverseAges();

let planetAffiliationConnectMap: Map<
  number,
  DynamicPlanetAffiliationConnectData
> = null;
let planetAffiliationConnectData: DynamicPlanetAffiliationConnectData[] = null;

async function buildPlanetAffiliationAgeData() {
  const tmpPlanetAffiliationAgeData: PlanetAffiliationAgeWithNamesData[] =
    await window.sql.getAllPlanetAffiliationAgesWithNames();

  planetAffiliationConnectMap = new Map<
    number,
    DynamicPlanetAffiliationConnectData
  >();

  tmpPlanetAffiliationAgeData.forEach((planetAffiliationAge) => {
    let item = planetAffiliationConnectMap.get(planetAffiliationAge.planetID);
    const key = `age${planetAffiliationAge.universeAge}` as `age${number}`;
    const affiliationData = {
      universeAge: planetAffiliationAge.universeAge,
      affiliationID: planetAffiliationAge.affiliationID,
      planetText: planetAffiliationAge.planetText,
      affiliationName: planetAffiliationAge.affiliationName
    };
    if (!item) {
      item = {
        planetID: planetAffiliationAge.planetID,
        planetName: planetAffiliationAge.planetName,
        affiliationData: {}
      };
      // TODO: Remove the need to define this for each element each time we add a new universe age
      currentUsedUniverseAges.forEach((age) => {
        item.affiliationData[`age${age}`] = {
          affiliationID: undefined,
          affiliationName: undefined,
          planetText: undefined,
          universeAge: undefined
        };
      });

      planetAffiliationConnectMap.set(planetAffiliationAge.planetID, item);
    }

    item.affiliationData[key] = affiliationData;
  });

  planetAffiliationConnectData = Array.from(
    planetAffiliationConnectMap.values()
  );
}

// element definitions
const tableParent = document.getElementById('table-holder');

const planetModalElement = document.getElementById('planet-modal');
const planetForm = document.getElementById('planet-form');
const planetSaveBtn = document.getElementById('planet-save');

const affiliationModalElement = document.getElementById('affiliation-modal');
const affiliationForm = document.getElementById('affiliation-form');
const affiliationSaveBtn = document.getElementById('affiliation-save');

const planetAgeCopyModalElement = document.getElementById(
  'planet-age-copy-modal'
);
const planetAgeCopyForm = document.getElementById('planet-age-copy-form');
const planetAgeCopySaveBtn = document.getElementById('planet-age-copy-save');

const planetAffiliationConnectModalElement = document.getElementById(
  'planet-affiliation-connect-modal'
);
const planetAffiliationConnectForm = document.getElementById(
  'planet-affiliation-connect-form'
);
const planetAffiliationConnectSaveBtn = document.getElementById(
  'planet-affiliation-connect-save'
);

const toastContainer = document.getElementById('toast-container');
const dialogContainer = document.getElementById('dialog-container');

// planet form elements
const planetFormID = document.getElementById('planet-id') as HTMLInputElement;
const planetFormName = document.getElementById(
  'planet-name'
) as HTMLInputElement;
const planetFormCoordX = document.getElementById(
  'planet-x'
) as HTMLInputElement;
const planetFormCoordY = document.getElementById(
  'planet-y'
) as HTMLInputElement;
const planetFormLink = document.getElementById(
  'planet-link'
) as HTMLInputElement;
const planetFormType = document.getElementById(
  'planet-type'
) as HTMLInputElement;

const planetFormDetail = document.getElementById(
  'planet-detail'
) as HTMLTextAreaElement;
const planetFormFuelingStation = document.getElementById(
  'planet-fueling-station'
) as HTMLInputElement;
const planetFormJumpDistance = document.getElementById(
  'planet-jump-distance'
) as HTMLInputElement;

// affiliation form elements
const affiliationFormID = document.getElementById(
  'affiliation-id'
) as HTMLInputElement;
const affiliationFormName = document.getElementById(
  'affiliation-name'
) as HTMLInputElement;
const affiliationFormColor = document.getElementById(
  'affiliation-color'
) as HTMLInputElement;

// planet affiliation connect from elements
const planetAffiliationConnectPlanetID = document.getElementById(
  'planet-affiliation-connect-planet-id'
) as HTMLSelectElement;
const planetAffiliationConnectAffiliationID = document.getElementById(
  'planet-affiliation-connect-affiliation-id'
) as HTMLSelectElement;
const planetAffiliationConnectPlanetText = document.getElementById(
  'planet-affiliation-connect-planet-text'
) as HTMLTextAreaElement;

const planetAffiliationConnectUniverseAgeSelect = document.getElementById(
  'planet-affiliation-connect-age'
) as HTMLSelectElement;

const planetAffiliationConnectUniverseNewAgeInput = document.getElementById(
  'planet-affiliation-connect-new-age'
) as HTMLSelectElement;

const planetAffiliationConnectDeleteBtn = document.getElementById(
  'planet-affiliation-connect-delete'
) as HTMLButtonElement;

// planet age copy form elements
const planetAgeCopyFormTarget = document.getElementById(
  'planet-age-copy-target'
) as HTMLSelectElement;

const planetAgeCopyFormDestination = document.getElementById(
  'planet-age-copy-destination'
) as HTMLInputElement;

// Toast setup

const toastHandler = new ToastHandler(toastContainer, ['text-white']);

// loading indicator setup
const loader = document.getElementById('loader');

const loadingIndicator = new RingLoadingIndicator(loader, 'lds-ring-dark');

// planet form and modal setups
let currentEditPlanet: PlanetCoordData = undefined;
const planetModal = new Modal(planetModalElement, {});

const planetTagEditor = new PlanetTagEditor({
  newTagInput: document.getElementById(
    'new-planet-tag-input'
  ) as HTMLInputElement,
  newTagKeyAddBtn: document.getElementById(
    'new-planet-tag-btn'
  ) as HTMLButtonElement,
  tagEditorContainer: document.getElementById(
    'planet-tag-editor-container'
  ) as HTMLDivElement,
  toastHandler: toastHandler
});

const planetCivilizationDropdown = new Dropdown(
  document.getElementById('planet-civilization') as HTMLSelectElement
)
  .setItems([
    { value: 'None', default: true },
    { value: 'Primitive' },
    { value: 'Innersphere' },
    { value: 'Periphery' }
  ])
  .render();

const planetPopulationDropdown = new Dropdown(
  document.getElementById('planet-population') as HTMLSelectElement
)
  .setItems([
    { value: 'None', default: true },
    { value: 'Low' },
    { value: 'Small' },
    { value: 'Medium' },
    { value: 'Large' }
  ])
  .render();

const planetSizeDropdown = new Dropdown(
  document.getElementById('planet-size') as HTMLSelectElement
)
  .setItems([
    { value: 'Unknown', default: true },
    { value: 'Small' },
    { value: 'Medium' },
    { value: 'Large' }
  ])
  .render();

planetForm.addEventListener('submit', (e) => e.preventDefault());

planetSaveBtn.addEventListener('click', () => {
  const id = Number(planetFormID.value);
  const name = planetFormName.value.trim();
  const x = Number(parseFloat(planetFormCoordX.value).toFixed(2));
  const y = Number(parseFloat(planetFormCoordY.value).toFixed(2));
  const link = planetFormLink.value.trim() || 'https://www.sarna.net/wiki/';

  const type = planetFormType.value.trim().slice(0, 1).toUpperCase();
  const detail = planetFormDetail.value.trim();
  const size = planetSizeDropdown.getSelected().value;
  const population = planetPopulationDropdown.getSelected().value;
  const fuelingStation = planetFormFuelingStation.checked;
  const civilization = planetCivilizationDropdown.getSelected().value;
  const jumpDistance = parseInt(planetFormJumpDistance.value);

  const tagObject = planetTagEditor.getCurrentTagUpdates();

  if (name.length <= 0) {
    toastHandler.createAndShowToast(
      'Error',
      "Name can't be empty",
      ToastType.Danger
    );
    return;
  }

  if (type.length <= 0) {
    toastHandler.createAndShowToast(
      'Error',
      "Type can't be empty",
      ToastType.Danger
    );
    return;
  }

  if (isNaN(x) || isNaN(y)) {
    toastHandler.createAndShowToast(
      'Error',
      "Coordinates can't be NaN",
      ToastType.Danger
    );
    return;
  }

  if (
    typeof jumpDistance !== 'number' ||
    isNaN(jumpDistance) ||
    jumpDistance < 0
  ) {
    toastHandler.createAndShowToast(
      'Error',
      "Jump Distance can't be less then 0 or undefined.",
      ToastType.Danger
    );
    return;
  }

  if (
    name !== currentEditPlanet?.name &&
    planetsData.filter((planet) => planet.name === name).length > 0
  ) {
    toastHandler.createAndShowToast(
      'Error',
      'You cannot create or update a planet with/to the same name as an existing planet.',
      ToastType.Danger
    );
    return;
  }

  if (
    planetsData.filter(
      (planet) =>
        planet.coord.x === x &&
        planet.coord.y === y &&
        (currentEditPlanet
          ? planet.name !== currentEditPlanet.name
          : planet.name !== name)
    ).length > 0
  ) {
    toastHandler.createAndShowToast(
      'Error',
      'You cannot create or update a planet with/to the same coordinates as an existing planet.',
      ToastType.Danger
    );
    return;
  }

  if (currentEditPlanet === undefined) {
    // Create new planet
    window.sql
      .createPlanet({
        x: x,
        y: y,
        link: link,
        name: name,
        detail: detail,
        fuelingStation: fuelingStation,
        type: type,
        tagObject: tagObject,
        civilization: civilization,
        population: population,
        size: size,
        jumpDistance: jumpDistance
      })
      .then((newID) => {
        toastHandler.createAndShowToast(
          'Planet',
          'Planet created',
          ToastType.Info
        );
        planetTable.addData(
          planetDataToPlanetCoordData({
            id: newID,
            x: x,
            y: y,
            link: link,
            name: name,
            detail: detail,
            fuelingStation: fuelingStation,
            type: type,
            tagObject: tagObject,
            civilization: civilization,
            population: population,
            size: size,
            jumpDistance: jumpDistance
          })
        );
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      )
      .finally(() => {
        planetTable.updateTable();
      });
  } else {
    window.sql
      .updatePlanet({
        id: id,
        x: x,
        y: y,
        link: link,
        name: name,
        detail: detail,
        fuelingStation: fuelingStation,
        type: type,
        tagObject: tagObject,
        civilization: civilization,
        population: population,
        size: size,
        jumpDistance: jumpDistance
      })
      .then(() => {
        // Update planet
        currentEditPlanet.id = id;
        currentEditPlanet.name = name;
        currentEditPlanet.coord.x = x;
        currentEditPlanet.coord.y = y;
        currentEditPlanet.link = link;

        // new planet data
        currentEditPlanet.tagObject = tagObject;
        currentEditPlanet.fuelingStation = false;
        currentEditPlanet.detail = detail;
        currentEditPlanet.type = type;
        currentEditPlanet.civilization = civilization;
        currentEditPlanet.population = population;
        currentEditPlanet.size = size;
        currentEditPlanet.jumpDistance = jumpDistance;

        toastHandler.createAndShowToast(
          'Planet',
          'Planet updated',
          ToastType.Info
        );
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      )
      .finally(() => {
        planetTable.updateTable();
      });
  }
  planetModal.hide();
});

function setPlanetFormData(planet: PlanetCoordData) {
  planetFormID.value = String(planet?.id ?? -1);
  planetFormName.value = planet?.name ?? '';
  planetFormCoordX.value = String(planet?.coord?.x ?? 0);
  planetFormCoordY.value = String(planet?.coord?.y ?? 0);
  planetFormLink.value = planet?.link ?? '';

  // New planet data
  planetFormType.value = planet?.type ?? 'X';
  planetFormFuelingStation.checked = planet?.fuelingStation ?? false;
  planetFormDetail.value = planet?.detail ?? '';
  planetFormJumpDistance.value = String(planet?.jumpDistance ?? 0);

  planetCivilizationDropdown.setSelected(planet?.civilization);
  planetPopulationDropdown.setSelected(planet?.population);
  planetSizeDropdown.setSelected(planet?.size);
}

function openPlanetCreateModal(planet: PlanetCoordData = undefined) {
  currentEditPlanet = planet;
  setPlanetFormData(planet);
  planetTagEditor.loadEditor(planet?.tagObject);
  planetModal.show();
}

// planet age copy modal and form setups
planetAgeCopyForm.addEventListener('submit', (e) => e.preventDefault());

const planetAgeCopyModal = new Modal(planetAgeCopyModalElement, {});

function openPlanetAffiliationConnectCopyModal() {
  // clear age selection element to add the current existing one
  planetAgeCopyFormTarget.innerHTML = '';

  for (const age of currentUsedUniverseAges) {
    const ageOption = document.createElement('option');
    ageOption.value = String(age);
    ageOption.textContent = String(age);

    planetAgeCopyFormTarget.appendChild(ageOption);
  }
  planetAgeCopyFormDestination.value = '9999';
  planetAgeCopyModal.show();
}

planetAgeCopySaveBtn.addEventListener('click', () => {
  const targetAge = Number(planetAgeCopyFormTarget.value);
  const destinationAge = Math.ceil(
    Number(parseFloat(planetAgeCopyFormDestination.value).toFixed(0))
  );

  if (isNaN(destinationAge)) {
    toastHandler.createAndShowToast(
      'Error',
      "Destination can't be NaN",
      ToastType.Danger
    );
    return;
  }

  if (targetAge === destinationAge) {
    toastHandler.createAndShowToast(
      'Info',
      'Destination and target are equal. This is not allowed!',
      ToastType.Info
    );
    return;
  }

  // Get all planets, which are already in the "new" universe age
  const destinationDataPoints = planetAffiliationConnectData.filter((data) => {
    for (const key of Object.keys(data.affiliationData)) {
      const age = data.affiliationData[key].universeAge;
      if (age && age === destinationAge) return true;
    }
    return false;
  });

  // Get all planets, which needs to be added to the "new" universe age
  const targetDataPoints = planetAffiliationConnectData
    .filter((data) => {
      for (const key of Object.keys(data.affiliationData)) {
        const age = data.affiliationData[key].universeAge;
        if (
          age && // is the age set
          age === targetAge && // and the age is the same as the target age
          // and are not already in the destination planets
          destinationDataPoints.filter(
            (destData) => destData.planetID === data.planetID
          ).length <= 0
        )
          return true;
      }
      return false;
    })
    .map((data) => {
      // Map the data points to the PlanetAffiliationAgeData, which is supported by the backend
      return {
        planetID: data.planetID,
        affiliationID: data.affiliationData[`age${targetAge}`].affiliationID,
        planetText: data.affiliationData[`age${targetAge}`].planetText,
        universeAge: destinationAge
      } as PlanetAffiliationAgeData;
    });

  if (targetDataPoints.length <= 0) {
    toastHandler.createAndShowToast(
      'Info',
      `No Planets to copy. All planets from ${targetAge} are already in ${destinationAge}`,
      ToastType.Info
    );
    planetAgeCopyModal.hide();
    return;
  }

  loadingIndicator.show();

  // TODO: create helper or something for json parse
  window.sql
    .createPlanetAffiliationAges(JSON.parse(JSON.stringify(targetDataPoints)))
    .then((dataPoints) => {
      // Add the new data points to the already existing planet affiliation connect data points with the "new" universe age
      for (const dataPoint of planetAffiliationConnectData) {
        const elem = dataPoints.filter(
          (val) => val.planetID === dataPoint.planetID
        )[0];
        planetAffiliationConnectMap.get(dataPoint.planetID).affiliationData[
          `age${destinationAge}`
        ] = {
          universeAge: elem?.universeAge,
          affiliationID: elem?.affiliationID,
          planetText: elem?.planetText,
          affiliationName: planetAffiliationConnectMap.get(elem?.planetID)
            ?.affiliationData[`age${targetAge}`]?.affiliationName
        };
      }

      currentUsedUniverseAges.add(destinationAge);

      toastHandler.createAndShowToast(
        'Planet',
        `Copied planets from age ${targetAge} to age ${destinationAge}`,
        ToastType.Info
      );
      loadingIndicator.hide();
    })
    .catch((reason) => {
      toastHandler.createAndShowToast('Error', reason, ToastType.Danger);
      loadingIndicator.hide();
    })
    .finally(() => {
      refreshFullPlanetAffiliationConnectTableData();
    });

  planetAgeCopyModal.hide();
});

// affiliation form and modal setups
let currentEditAffiliation: AffiliationData = undefined;

affiliationForm.addEventListener('submit', (e) => e.preventDefault());

const affiliationModal = new Modal(affiliationModalElement, {});

affiliationSaveBtn.addEventListener('click', () => {
  const id = Number(affiliationFormID.value);
  const name = affiliationFormName.value.trim();
  const color = affiliationFormColor.value;

  if (name.length <= 0) {
    toastHandler.createAndShowToast(
      'Error',
      "Name can't be empty",
      ToastType.Danger
    );
    return;
  }

  if (
    affiliationsData.filter(
      (affiliation) => affiliation.name === name && id !== affiliation.id
    ).length > 0
  ) {
    toastHandler.createAndShowToast(
      'Error',
      `Affiliation with name ${name} already exists`,
      ToastType.Danger
    );
    return;
  }

  if (currentEditAffiliation === undefined) {
    // Create new affiliation
    window.sql
      .createAffiliation({
        name: name,
        color: color
      })
      .then((newID) => {
        toastHandler.createAndShowToast(
          'Affiliation',
          'Affiliation created',
          ToastType.Info
        );
        affiliationTable.addData({ id: newID, name: name, color: color });
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      )
      .finally(() => {
        affiliationTable.updateTable();
      });
  } else {
    // Update affiliation
    currentEditAffiliation.id = id;
    currentEditAffiliation.name = name;
    currentEditAffiliation.color = color;
    window.sql
      .updateAffiliation(currentEditAffiliation)
      .then(() => {
        toastHandler.createAndShowToast(
          'Affiliation',
          'Affiliation updated',
          ToastType.Info
        );
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      )
      .finally(() => {
        affiliationTable.updateTable();
      });
  }
  affiliationModal.hide();
});

function openAffiliationCreateModal(affiliation: AffiliationData = undefined) {
  currentEditAffiliation = affiliation;
  setAffiliationFormData(affiliation);
  affiliationModal.show();
}

function setAffiliationFormData(affiliation: AffiliationData) {
  affiliationFormID.value = String(affiliation?.id ?? -1);
  affiliationFormName.value = affiliation?.name ?? '';
  affiliationFormColor.value = affiliation?.color ?? '';
}

// planet affiliation connect modal and form setups
// TODO: Logic to delete a planet affiliation connect data point for a specific age

let editPlanetAffiliationConnectData: DynamicPlanetAffiliationConnectData =
  undefined;

// Change the visibility of the new age input if -1(New) gets selected
planetAffiliationConnectUniverseAgeSelect.addEventListener(
  'change',
  (event) => {
    const selectedUniverseAge = parseFloat(
      (event.target as HTMLSelectElement).value
    );
    if (selectedUniverseAge === -1) {
      planetAffiliationConnectUniverseNewAgeInput.style.display = '';
      planetAffiliationConnectDeleteBtn.disabled = true;
      planetAffiliationConnectPlanetText.value = '';
      planetAffiliationConnectAffiliationID.value = '0';
    } else {
      planetAffiliationConnectUniverseNewAgeInput.style.display = 'none';
      planetAffiliationConnectDeleteBtn.disabled = false;
      setPlanetAffiliationConnectFormData(
        editPlanetAffiliationConnectData,
        selectedUniverseAge
      );
    }
  }
);

planetAffiliationConnectDeleteBtn.addEventListener('click', () => {
  const selectedUniverseAge = parseFloat(
    planetAffiliationConnectUniverseAgeSelect.value
  );

  // we can't delete anything which does not exist yet
  if (selectedUniverseAge === -1 || !editPlanetAffiliationConnectData) return;

  const planetAffiliationAgeDataToDelete = {
    affiliationID:
      editPlanetAffiliationConnectData.affiliationData[
        `age${selectedUniverseAge}`
      ].affiliationID,
    planetID: editPlanetAffiliationConnectData.planetID,
    planetText:
      editPlanetAffiliationConnectData.affiliationData[
        `age${selectedUniverseAge}`
      ].planetText,
    universeAge: selectedUniverseAge
  } as PlanetAffiliationAgeData;

  window.sql
    .deletePlanetAffiliationAge(
      JSON.parse(JSON.stringify(planetAffiliationAgeDataToDelete))
    )
    .then(() => {
      editPlanetAffiliationConnectData.affiliationData[
        `age${selectedUniverseAge}`
      ].planetText = undefined;
      editPlanetAffiliationConnectData.affiliationData[
        `age${selectedUniverseAge}`
      ].affiliationID = undefined;
      editPlanetAffiliationConnectData.affiliationData[
        `age${selectedUniverseAge}`
      ].universeAge = undefined;
      editPlanetAffiliationConnectData.affiliationData[
        `age${selectedUniverseAge}`
      ].affiliationName = undefined;

      initPlanetAffiliationConnectForm(editPlanetAffiliationConnectData);

      const ageStillHasValues = planetAffiliationConnectData.some(
        (dataPoint) =>
          dataPoint.affiliationData[`age${selectedUniverseAge}`].universeAge !==
          undefined
      );

      const planetStillHasUniverseAgeValues = Object.keys(
        editPlanetAffiliationConnectData.affiliationData
      ).some(
        (key) =>
          editPlanetAffiliationConnectData.affiliationData[key].universeAge !==
          undefined
      );

      if (!ageStillHasValues) {
        currentUsedUniverseAges.delete(selectedUniverseAge);
      }

      if (!planetStillHasUniverseAgeValues) {
        planetAffiliationConnectModal.hide();
      }

      toastHandler.createAndShowToast(
        'Planet Affiliation Connect',
        'Data deleted',
        ToastType.Info
      );
    })
    .catch((reason) => {
      toastHandler.createAndShowToast('Error', reason, ToastType.Danger);
    })
    .finally(() => {
      refreshFullPlanetAffiliationConnectTableData();
    });
});

const planetAffiliationConnectModal = new Modal(
  planetAffiliationConnectModalElement,
  {}
);

planetAffiliationConnectForm.addEventListener('submit', (e) =>
  e.preventDefault()
);

planetAffiliationConnectSaveBtn.addEventListener('click', () => {
  const planetID = Number(planetAffiliationConnectPlanetID.value);
  const affiliationID = Number(planetAffiliationConnectAffiliationID.value);
  const selectedUniverseAge = parseFloat(
    planetAffiliationConnectUniverseAgeSelect.value
  );

  // possible new universe age, iff selectedUniverseAge = -1
  const newUniverseAge = Number(
    parseFloat(planetAffiliationConnectUniverseNewAgeInput.value).toFixed(0)
  );

  const planetText = planetAffiliationConnectPlanetText.value;

  const universeAge =
    selectedUniverseAge === -1 ? newUniverseAge : selectedUniverseAge;

  if (!planetID) {
    toastHandler.createAndShowToast(
      'Error',
      `No planet selected!`,
      ToastType.Danger
    );
    return;
  }

  if (selectedUniverseAge === -1 && isNaN(newUniverseAge)) {
    toastHandler.createAndShowToast(
      'Error',
      `Either a already existing universe age has to be selected or a new universe age needs to be provided!`,
      ToastType.Danger
    );
    return;
  }

  if (
    selectedUniverseAge === -1 &&
    currentUsedUniverseAges.has(newUniverseAge)
  ) {
    toastHandler.createAndShowToast(
      'Error',
      `Universe age ${newUniverseAge} already exists!`,
      ToastType.Danger
    );
    return;
  }

  const planetAffiliationAgeElement = {
    affiliationID: affiliationID,
    planetID: planetID,
    planetText: planetText,
    universeAge: universeAge
  } as PlanetAffiliationAgeData;

  if (editPlanetAffiliationConnectData) {
    if (selectedUniverseAge === -1) {
      // add new universe age
      window.sql
        .createPlanetAffiliationAge(
          JSON.parse(JSON.stringify(planetAffiliationAgeElement))
        )
        .then(() => {
          editPlanetAffiliationConnectData.affiliationData[
            `age${universeAge}`
          ] = {
            affiliationID: affiliationID,
            planetText: planetText,
            affiliationName: affiliationsData.find(
              (affiliation) => affiliation.id === affiliationID
            )?.name,
            universeAge: universeAge
          };

          // add universe age data to all other data points as undefined
          for (const planetAffiliationConnectElement of planetAffiliationConnectData) {
            if (
              planetAffiliationConnectElement !==
              editPlanetAffiliationConnectData
            ) {
              planetAffiliationConnectElement.affiliationData[
                `age${universeAge}`
              ] = {
                affiliationID: undefined,
                affiliationName: undefined,
                planetText: undefined,
                universeAge: undefined // needs to be undefined, for the copy by age modal and the create or update and for the planet affiliation connect data logic
              };
            }
          }

          currentUsedUniverseAges.add(universeAge);

          toastHandler.createAndShowToast(
            'Planet Affiliation Connect',
            'Data created',
            ToastType.Info
          );
        })
        .catch((reason) =>
          toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
        )
        .finally(() => {
          refreshFullPlanetAffiliationConnectTableData();
        });
    } else {
      // update data with existing universe age

      const updatePlanetAffiliationAgeObject = () => {
        editPlanetAffiliationConnectData.affiliationData[
          `age${universeAge}`
        ].affiliationID = affiliationID;
        editPlanetAffiliationConnectData.affiliationData[
          `age${universeAge}`
        ].planetText = planetText;
        editPlanetAffiliationConnectData.affiliationData[
          `age${universeAge}`
        ].affiliationName = affiliationsData.find(
          (affiliation) => affiliation.id === affiliationID
        )?.name;
        editPlanetAffiliationConnectData.affiliationData[
          `age${universeAge}`
        ].universeAge = universeAge;
      };

      if (
        editPlanetAffiliationConnectData.affiliationData[`age${universeAge}`]
          .universeAge === undefined
      ) {
        // we need to create this data point first
        window.sql
          .createPlanetAffiliationAge(
            JSON.parse(JSON.stringify(planetAffiliationAgeElement))
          )
          .then(() => {
            updatePlanetAffiliationAgeObject();
            toastHandler.createAndShowToast(
              'Planet Affiliation Connect',
              'Data updated',
              ToastType.Info
            );
          })
          .catch((reason) =>
            toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
          )
          .finally(() => {
            refreshFullPlanetAffiliationConnectTableData();
          });
      } else {
        window.sql
          .updatePlanetAffiliationAge(
            JSON.parse(JSON.stringify(planetAffiliationAgeElement))
          )
          .then(() => {
            updatePlanetAffiliationAgeObject();
            toastHandler.createAndShowToast(
              'Planet Affiliation Connect',
              'Data updated',
              ToastType.Info
            );
          })
          .catch((reason) =>
            toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
          )
          .finally(() => {
            refreshFullPlanetAffiliationConnectTableData();
          });
      }
    }
  } else {
    // create new planet affiliation connect data point

    window.sql
      .createPlanetAffiliationAge(
        JSON.parse(JSON.stringify(planetAffiliationAgeElement))
      )
      .then(() => {
        const newPlanetAffiliationConnectDataPoint = {
          planetID: planetAffiliationAgeElement.planetID,
          planetName: planetsData.find(
            (planet) => planet.id === planetAffiliationAgeElement.planetID
          )?.name,
          affiliationData: {}
        } as DynamicPlanetAffiliationConnectData;

        newPlanetAffiliationConnectDataPoint.affiliationData[
          `age${universeAge}`
        ] = {
          affiliationID: affiliationID,
          planetText: planetText,
          affiliationName: affiliationsData.find(
            (affiliation) => affiliation.id === affiliationID
          )?.name,
          universeAge: universeAge
        };

        for (const createUniverseAge of currentUsedUniverseAges) {
          if (createUniverseAge !== universeAge) {
            newPlanetAffiliationConnectDataPoint.affiliationData[
              `age${createUniverseAge}`
            ] = {
              affiliationID: undefined,
              planetText: undefined,
              affiliationName: undefined,
              universeAge: undefined
            };
          }
        }

        if (selectedUniverseAge === -1) {
          // add new universe age to all existing elements
          for (const planetAffiliationAgeDataPoint of planetAffiliationConnectData) {
            planetAffiliationAgeDataPoint.affiliationData[`age${universeAge}`] =
              {
                affiliationID: undefined,
                planetText: undefined,
                affiliationName: undefined,
                universeAge: undefined
              };
          }
          currentUsedUniverseAges.add(universeAge);
        }

        // Add new data point to dataset and map
        planetAffiliationConnectTable.addData(
          newPlanetAffiliationConnectDataPoint
        );
        planetAffiliationConnectMap.set(
          newPlanetAffiliationConnectDataPoint.planetID,
          newPlanetAffiliationConnectDataPoint
        );

        toastHandler.createAndShowToast(
          'Planet Affiliation Connect',
          'Data created',
          ToastType.Info
        );
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      )
      .finally(() => {
        refreshFullPlanetAffiliationConnectTableData();
      });
  }
  planetAffiliationConnectModal.hide();
});

function openPlanetAffiliationConnectCreateModal(
  data: DynamicPlanetAffiliationConnectData = undefined
) {
  editPlanetAffiliationConnectData = data;

  initPlanetAffiliationConnectForm(data);
  setPlanetAffiliationConnectFormData(undefined, -1);

  planetAffiliationConnectModal.show();
}

function initPlanetAffiliationConnectForm(
  data: DynamicPlanetAffiliationConnectData
) {
  addAllPlanetsToSelect(data);
  addAllAffiliationsToSelect();
  addUniverseAgesToSelect();
  planetAffiliationConnectPlanetID.value = String(data?.planetID || -1);
  planetAffiliationConnectPlanetID.disabled = data != undefined;
  planetAffiliationConnectUniverseAgeSelect.value = '-1';
  planetAffiliationConnectUniverseNewAgeInput.style.display = '';
  planetAffiliationConnectAffiliationID.value = '0';
  planetAffiliationConnectDeleteBtn.disabled = true;
}

function setPlanetAffiliationConnectFormData(
  data: DynamicPlanetAffiliationConnectData,
  age: number
) {
  planetAffiliationConnectAffiliationID.value = String(
    data?.affiliationData[`age${age}`]?.affiliationID || 0
  );
  planetAffiliationConnectPlanetText.value =
    data?.affiliationData[`age${age}`]?.planetText || '';
  planetAffiliationConnectUniverseNewAgeInput.value = '';
}
/**
 * Add all affiliations to the affiliation id select element
 */
function addAllAffiliationsToSelect() {
  // clear affiliation id select
  planetAffiliationConnectAffiliationID.innerHTML = '';

  // add all affiliations from list (list will be updated, iff a affiliation is added or removed or updated via the affiliations table)
  for (const affiliation of affiliationsData.toSorted((a1, a2) =>
    a1.name > a2.name ? 1 : -1
  )) {
    const affiliationOption = document.createElement('option');
    affiliationOption.value = String(affiliation.id);
    affiliationOption.textContent = affiliation.name;
    planetAffiliationConnectAffiliationID.appendChild(affiliationOption);
  }
}

/**
 * Add all affiliations to the affiliation id select element
 */
function addAllPlanetsToSelect(data: DynamicPlanetAffiliationConnectData) {
  // clear planet id select
  planetAffiliationConnectPlanetID.innerHTML = '';

  // add all planets from list (list will be updated, iff a affiliation is added or removed or updated via the planets table)
  for (const planet of planetsData
    .filter(
      (planet) =>
        !planetAffiliationConnectMap.has(planet.id) ||
        data?.planetID === planet.id
    )
    .toSorted((p1, p2) => (p1.name > p2.name ? 1 : -1))) {
    const planetOption = document.createElement('option');
    planetOption.value = String(planet.id);
    planetOption.textContent = planet.name;
    planetAffiliationConnectPlanetID.appendChild(planetOption);
  }
}

function addUniverseAgesToSelect() {
  planetAffiliationConnectUniverseAgeSelect.innerHTML = '';

  const universeAgeOptionNew = document.createElement('option');
  universeAgeOptionNew.value = String(-1);
  universeAgeOptionNew.textContent = 'New';
  planetAffiliationConnectUniverseAgeSelect.appendChild(universeAgeOptionNew);

  for (const universeAge of currentUsedUniverseAges) {
    const universeAgeOption = document.createElement('option');
    universeAgeOption.value = String(universeAge);
    universeAgeOption.textContent = String(universeAge);
    planetAffiliationConnectUniverseAgeSelect.appendChild(universeAgeOption);
  }
}

// tab setup
const navbar = document.getElementById('dashboard-navbar');
const tabGroup = new TabGroup(
  navbar,
  ['nav', 'nav-pills', 'flex-column'],
  [
    {
      text: 'Planets',
      icon: planetIcon,
      classNames: [
        'nav-link',
        'link-dark',
        'align-items-center',
        'd-flex',
        'active'
      ],
      onClick() {
        affiliationTable.remove();
        planetAffiliationConnectTable.remove();
        planetTable.render();
      }
    },
    {
      text: 'Affiliations',
      icon: affiliationIcon,
      classNames: ['nav-link', 'link-dark', 'align-items-center', 'd-flex'],
      onClick() {
        planetTable.remove();
        planetAffiliationConnectTable.remove();
        affiliationTable.render();
      }
    },
    {
      text: 'Planet Affiliation Connect',
      icon: planetAffiliationAgeIcon,
      classNames: ['nav-link', 'link-dark', 'align-items-center', 'd-flex'],
      onClick() {
        planetTable.remove();
        affiliationTable.remove();
        planetAffiliationConnectTable.render();
      }
    }
  ],
  'active'
);
tabGroup.render();

// Dialog setup

const dynamicDialog = new Dialog(dialogContainer);

// planet table
const planetTable = new Table<(typeof planetsData)[number]>(
  tableParent,
  'table table-striped table-hover user-select-none'.split(' '),
  25,
  {
    classNames:
      'navbar border-bottom d-flex justify-content-center bg-light sticky-top'.split(
        ' '
      ),
    searchBar: true,
    buttons: [
      {
        icon: addIcon,
        classNames: ['btn', 'btn-success', 'btn-sm', 'me-1'],
        onClick() {
          openPlanetCreateModal();
        }
      },
      {
        icon: uploadIcon,
        classNames: ['btn', 'btn-danger', 'btn-sm', 'me-1'],
        onClick() {
          loadingIndicator.show();
          window.app
            .importTableFromCSV('PlanetWithTagsView')
            .then(() => {
              loadingIndicator.hide();
              location.reload();
            })
            .catch((reason) => {
              toastHandler.createAndShowToast(
                'Error',
                'Fehler beim Import der CSV.\n' + reason,
                ToastType.Danger
              );
              loadingIndicator.hide();
            });
        }
      },
      {
        icon: downloadIcon,
        classNames: ['btn', 'btn-info', 'btn-sm', 'me-1'],
        onClick() {
          loadingIndicator.show();
          window.app
            .exportTableToCSV('PlanetWithTagsView')
            .then(() => {
              loadingIndicator.hide();
            })
            .catch((reason) => {
              toastHandler.createAndShowToast(
                'Error',
                'Fehler beim Export der Table.\n' + reason,
                ToastType.Danger
              );
              loadingIndicator.hide();
            });
        }
      }
    ]
  },
  [
    {
      header: {
        name: 'Action',
        size: 'col-1'
      },
      data: {
        type: 'button',
        buttons: [
          {
            icon: editIcon,
            classNames:
              'btn btn-primary btn-sm align-items-center p-1 me-1'.split(' '),
            onClick(data) {
              openPlanetCreateModal(data);
            }
          },
          {
            icon: deleteIcon,
            classNames: 'btn btn-danger btn-sm align-items-center p-1'.split(
              ' '
            ),
            onClick(data, rowIdx) {
              dynamicDialog.show(
                {
                  title: 'Delete Planet?',
                  classNames: ['fs-5']
                },
                {
                  content: `Do you want to delete the planet '${data.name}?`
                },
                {
                  buttons: [
                    {
                      text: 'Ok',
                      classNames: ['btn', 'btn-primary', 'ms-auto', 'me-1'],
                      onClick() {
                        window.sql
                          .deletePlanet(data.id)
                          .then(async () => {
                            dynamicDialog.hide();
                            planetTable.removeDataByIdx(rowIdx);

                            await refreshFullPlanetAffiliationConnectTableData();

                            toastHandler.createAndShowToast(
                              'Planet',
                              'Planet deleted',
                              ToastType.Info
                            );
                          })
                          .catch((reason) =>
                            toastHandler.createAndShowToast(
                              'Error',
                              reason,
                              ToastType.Danger
                            )
                          );
                      }
                    },
                    {
                      text: 'Cancel',
                      classNames: ['btn', 'btn-secondary'],
                      onClick() {
                        dynamicDialog.hide();
                      }
                    }
                  ]
                }
              );
            }
          }
        ]
      }
    },
    {
      header: { name: 'ID', size: 'col-1' },
      data: { type: 'binding', dataAttribute: 'id' }
    },
    {
      header: { name: 'Name', size: 'col-4' },
      data: { type: 'binding', dataAttribute: 'name' }
    },
    {
      header: { name: 'Coordinates', size: 'col-3' },
      data: {
        type: 'binding',
        dataAttribute: 'coord',
        formatter: new CoordStringFormatter()
      }
    },
    {
      header: {
        name: 'Civilization',
        size: 'col-1'
      },
      data: {
        type: 'binding',
        dataAttribute: 'civilization'
      }
    },
    {
      header: {
        name: 'Population',
        size: 'col-1'
      },
      data: {
        type: 'binding',
        dataAttribute: 'population'
      }
    },
    {
      header: {
        name: 'Size',
        size: 'col-1'
      },
      data: {
        type: 'binding',
        dataAttribute: 'size'
      }
    }
  ]
);

// affiliation table
const affiliationTable = new Table<(typeof affiliationsData)[number]>(
  tableParent,
  'table table-striped table-hover user-select-none'.split(' '),
  25,
  {
    classNames:
      'navbar border-bottom d-flex justify-content-center bg-light sticky-top'.split(
        ' '
      ),
    searchBar: true,
    buttons: [
      {
        icon: addIcon,
        classNames: ['btn', 'btn-sm', 'btn-success', 'me-1'],
        onClick() {
          openAffiliationCreateModal();
        }
      },
      {
        icon: uploadIcon,
        classNames: ['btn', 'btn-danger', 'btn-sm', 'me-1'],
        onClick() {
          loadingIndicator.show();
          window.app
            .importTableFromCSV('Affiliation')
            .then(() => {
              loadingIndicator.hide();
              location.reload();
            })
            .catch((reason) => {
              toastHandler.createAndShowToast(
                'Error',
                'Fehler beim Import der CSV.\n' + reason,
                ToastType.Danger
              );
              loadingIndicator.hide();
            });
        }
      },
      {
        icon: downloadIcon,
        classNames: ['btn', 'btn-info', 'btn-sm', 'me-1'],
        onClick() {
          loadingIndicator.show();
          window.app
            .exportTableToCSV('Affiliation')
            .then(() => {
              loadingIndicator.hide();
            })
            .catch((reason) => {
              toastHandler.createAndShowToast(
                'Error',
                'Fehler beim Export der Table.\n' + reason,
                ToastType.Danger
              );
              loadingIndicator.hide();
            });
        }
      }
    ]
  },
  [
    {
      header: {
        name: 'Action',
        size: 'col-1'
      },
      data: {
        type: 'button',
        buttons: [
          {
            icon: editIcon,
            classNames:
              'btn btn-primary btn-sm align-items-center p-1 me-1'.split(' '),
            onClick(data) {
              openAffiliationCreateModal(data);
            }
          },
          {
            icon: deleteIcon,
            classNames: 'btn btn-danger btn-sm align-items-center p-1'.split(
              ' '
            ),
            onClick(data, rowIdx) {
              dynamicDialog.show(
                {
                  title: 'Delete Affiliation?',
                  classNames: ['fs-5']
                },
                {
                  content: `Do you want to delete the affiliation '${data.name}?`
                },
                {
                  buttons: [
                    {
                      text: 'Ok',
                      classNames: ['btn', 'btn-primary', 'ms-auto', 'me-1'],
                      onClick() {
                        window.sql
                          .deleteAffiliation(data.id)
                          .then(async () => {
                            dynamicDialog.hide();
                            affiliationTable.removeDataByIdx(rowIdx);

                            await refreshFullPlanetAffiliationConnectTableData();

                            toastHandler.createAndShowToast(
                              'Affiliation',
                              'Affiliation deleted',
                              ToastType.Info
                            );
                          })
                          .catch((reason) =>
                            toastHandler.createAndShowToast(
                              'Error',
                              reason,
                              ToastType.Danger
                            )
                          );
                      }
                    },
                    {
                      text: 'Cancel',
                      classNames: ['btn', 'btn-secondary'],
                      onClick() {
                        dynamicDialog.hide();
                      }
                    }
                  ]
                }
              );
            },
            enabled(data) {
              return data.id != 0;
            }
          }
        ]
      }
    },
    {
      header: { name: 'ID', size: 'col-1' },
      data: { type: 'binding', dataAttribute: 'id' }
    },
    {
      header: { name: 'Name', size: 'col-5' },
      data: { type: 'binding', dataAttribute: 'name' }
    },
    {
      header: {
        name: 'Color',
        size: 'col-5'
      },
      data: {
        type: 'binding',
        dataAttribute: 'color'
      }
    }
  ]
);

// planet affiliation connect table

function addUniverseAgeColumnsToPlanetAffiliationConnectTable(
  universeAge: number
) {
  planetAffiliationConnectTable.addColumnAt(
    {
      header: { name: 'Affiliation ID ' + universeAge, size: 'col-space-3' },
      data: {
        type: 'binding',
        dataAttribute: `affiliationData.age${universeAge}.affiliationID`
      }
    },
    planetAffiliationConnectTable.getColumns().length
  );
  planetAffiliationConnectTable.addColumnAt(
    {
      header: { name: 'Affiliation Name ' + universeAge, size: 'col-space-3' },
      data: {
        type: 'binding',
        dataAttribute: `affiliationData.age${universeAge}.affiliationName`
      }
    },
    planetAffiliationConnectTable.getColumns().length
  );
  planetAffiliationConnectTable.addColumnAt(
    {
      header: { name: 'Planet Text ' + universeAge, size: 'col-space-7' },
      data: {
        type: 'binding',
        dataAttribute: `affiliationData.age${universeAge}.planetText`
      }
    },
    planetAffiliationConnectTable.getColumns().length
  );
}

const planetAffiliationConnectTable =
  new Table<DynamicPlanetAffiliationConnectData>(
    tableParent,
    'table table-striped table-hover user-select-none'.split(' '),
    25,
    {
      classNames:
        'navbar border-bottom d-flex justify-content-center bg-light sticky-top'.split(
          ' '
        ),
      searchBar: true,
      buttons: [
        {
          icon: addIcon,
          classNames: ['btn', 'btn-sm', 'btn-success', 'me-1'],
          onClick() {
            openPlanetAffiliationConnectCreateModal();
          }
        },
        {
          icon: copyIcon,
          classNames: ['btn', 'btn-sm', 'btn-warning', 'me-2'],
          onClick() {
            openPlanetAffiliationConnectCopyModal();
          }
        },
        {
          icon: uploadIcon,
          classNames: ['btn', 'btn-danger', 'btn-sm', 'me-1'],
          onClick() {
            loadingIndicator.show();
            window.app
              .importTableFromCSV('PlanetAffiliationAge')
              .then(() => {
                loadingIndicator.hide();
                location.reload();
              })
              .catch((reason) => {
                toastHandler.createAndShowToast(
                  'Error',
                  'Fehler beim Import der CSV.\n' + reason,
                  ToastType.Danger
                );
                loadingIndicator.hide();
              });
          }
        },
        {
          icon: downloadIcon,
          classNames: ['btn', 'btn-info', 'btn-sm', 'me-1'],
          onClick() {
            loadingIndicator.show();
            window.app
              .exportTableToCSV('PlanetAffiliationAge')
              .then(() => {
                loadingIndicator.hide();
              })
              .catch((reason) => {
                toastHandler.createAndShowToast(
                  'Error',
                  'Fehler beim Export der Table.\n' + reason,
                  ToastType.Danger
                );
                loadingIndicator.hide();
              });
          }
        }
      ]
    },
    [
      {
        header: {
          name: 'Action',
          size: 'col-space-1'
        },
        data: {
          type: 'button',
          buttons: [
            {
              icon: editIcon,
              classNames: ['btn', 'btn-sm', 'btn-primary', 'me-1', 'p-1'],
              onClick(data) {
                openPlanetAffiliationConnectCreateModal(data);
              }
            }
          ]
        }
      },
      {
        header: {
          name: 'Planet-ID',
          size: 'col-space-1'
        },
        data: {
          type: 'binding',
          dataAttribute: 'planetID'
        }
      },
      {
        header: {
          name: 'Planet Name',
          size: 'col-space-4'
        },
        data: {
          type: 'binding',
          dataAttribute: 'planetName'
        }
      }
    ]
  );

// Set data to table
planetTable.setData(planetsData);
affiliationTable.setData(affiliationsData);

const initialPlanetAffiliationAgeColumnCount =
  planetAffiliationConnectTable.getColumns().length - 1;

async function refreshFullPlanetAffiliationConnectTableData() {
  const columnLength = planetAffiliationConnectTable.getColumns().length;
  for (let i = columnLength; i > initialPlanetAffiliationAgeColumnCount; i--) {
    planetAffiliationConnectTable.removeColumnByIndex(i);
  }

  await buildPlanetAffiliationAgeData();

  planetAffiliationConnectTable.setData(
    planetAffiliationConnectData,
    (v1, v2) => v1.planetID - v2.planetID
  );

  // Add all current active universe ages to the planet affiliation connection table
  for (const universeAge of currentUsedUniverseAges) {
    addUniverseAgeColumnsToPlanetAffiliationConnectTable(universeAge);
  }
}

await refreshFullPlanetAffiliationConnectTableData();

// Start dashboard with planet table
planetTable.render();
