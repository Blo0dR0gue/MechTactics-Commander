// Init file for the dashboard page

// TODO: Update the dynamic modal to also hold forms
// TODO: Short this file
// TODO: Cleanup (PRIO!!!)

// Import custom CSS to load bootstrap and override variables
import { Modal } from 'bootstrap';
import './styles/main.scss';
import { Table } from './utils/components/Table';
import {
  createSVGElementFromString,
  planetCoordDataToPlanetData,
  planetDataToPlanetCoordData,
} from './utils/Utils';
import { ToastHandler, ToastType } from './utils/components/ToastHandler';
import { RingLoadingIndicator } from './utils/components/RingLoadingIndicator';
import { Dialog } from './utils/components/Dialog';
import { AffiliationData } from '../types/AffiliationData';
import { PlanetCoordData } from '../types/PlanetData';
import {
  PlanetAffiliationAgeData,
  PlanetAffiliationAgeWithNamesData,
} from '../types/PlanetAffiliationAge';
import { TabGroup } from './utils/components/TabGroup';

type DynamicPlanetAffiliationAge = {
  planetID: number;
  planetName: string;
  affiliationData: {
    affiliationID: number;
    planetText: string;
    affiliationName: string;
  };
  [key: `age${number}`]: number;
};

// get planet and affiliation data
const affiliations: AffiliationData[] = await window.sql.getAllAffiliations();

const planets: PlanetCoordData[] = await window.sql
  .getAllPlanets()
  .then((data) => data.map((planet) => planetDataToPlanetCoordData(planet)));

// TODO: Remove mapping of the data with the names of the planet or affiliation. This is because the formatter on the table was to slow while searching. this needs to be optimized

const planetAffiliationAges: PlanetAffiliationAgeWithNamesData[] =
  await window.sql.getAllPlanetAffiliationAgesWithNames();

// TODO: Customer wants to have a smaller table where each planet is only once in the Planet Affiliation Connect table.
const convertedArray: DynamicPlanetAffiliationAge[] =
  planetAffiliationAges.reduce((acc, item) => {
    const existingPlanet = acc.find((p) => p.planetID === item.planetID);

    if (existingPlanet) {
      // If the planet already exists in the new array, add a new age property
      const newAgeKey = `age${item.universeAge}`;
      existingPlanet[newAgeKey] = item.universeAge;
    } else {
      // If the planet does not exist in the new array, create a new entry
      const newEntry = {
        planetID: item.planetID,
        planetName: item.planetName,
        affiliationData: {
          affiliationID: item.affiliationID,
          planetText: item.planetText,
          affiliationName: item.affiliationName,
        },
        [`age` + item.universeAge]: item.universeAge,
      };
      acc.push(newEntry);
    }

    return acc;
  }, []);

console.log(convertedArray);

// icon setup
const editIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
</svg>`);

const deleteIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg>`);

const addIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
</svg>`);

const copyIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="" viewBox="0 0 16 16">
<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
<path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
</svg>`);

const planetIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="" viewBox="0 0 16 16">
  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 1 2.04 4.327Z"/></svg>`);

const affiliationIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="" viewBox="0 0 16 16">
   <path d="M4 9.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5zm1 .5v3h6v-3h-1v.5a.5.5 0 0 1-1 0V10z"/>
   <path d="M8 0a2 2 0 0 0-2 2H3.5a2 2 0 0 0-2 2v1c0 .52.198.993.523 1.349A.5.5 0 0 0 2 6.5V14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6.5a.5.5 0 0 0-.023-.151c.325-.356.523-.83.523-1.349V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2-2m0 1a1 1 0 0 0-1 1h2a1 1 0 0 0-1-1M3 14V6.937c.16.041.327.063.5.063h4v.5a.5.5 0 0 0 1 0V7h4c.173 0 .34-.022.5-.063V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1m9.5-11a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/></svg>`);

const planetAffiliationAgeIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="" viewBox="0 0 16 16">
  <path d="M8 4a.5.5 0 0 1 .5.5V6H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V7H6a.5.5 0 0 1 0-1h1.5V4.5A.5.5 0 0 1 8 4m-2.5 6.5A.5.5 0 0 1 6 10h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5"/>
  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/>
</svg>`);

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

const planetAffiliationAgeModalElement = document.getElementById(
  'planet-affiliation-age-modal'
);
const planetAffiliationAgeForm = document.getElementById(
  'planet-affiliation-age-form'
);
const planetAffiliationAgeSaveBtn = document.getElementById(
  'planet-affiliation-age-save'
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

// planet affiliation age from elements
const planetAffiliationAgePlanetID = document.getElementById(
  'planet-affiliation-age-planet-id'
) as HTMLSelectElement;
const planetAffiliationAgeAffiliationID = document.getElementById(
  'planet-affiliation-age-affiliation-id'
) as HTMLSelectElement;
const planetAffiliationAgeUniverseAge = document.getElementById(
  'planet-affiliation-age-universe-age'
) as HTMLInputElement;
const planetAffiliationAgePlanetText = document.getElementById(
  'planet-affiliation-age-planet-text'
) as HTMLTextAreaElement;

// planet age copy form elements
const planetAgeCopyFormTarget = document.getElementById(
  'planet-age-copy-target'
) as HTMLSelectElement;

const planetAgeCopyFormDestination = document.getElementById(
  'planet-age-copy-destination'
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

// Toast setup

const toastHandler = new ToastHandler(toastContainer, ['text-white']);

// loading indicator setup
const loader = document.getElementById('loader');

const loadingIndicator = new RingLoadingIndicator(loader, 'lds-ring-dark');

// planet form and modal setups
let currentEditPlanet: PlanetCoordData = undefined;
const planetModal = new Modal(planetModalElement, {});

planetForm.addEventListener('submit', (e) => e.preventDefault());

planetSaveBtn.addEventListener('click', () => {
  const id = Number(planetFormID.value);
  const name = planetFormName.value.trim();
  const x = Number(parseFloat(planetFormCoordX.value).toFixed(2));
  const y = Number(parseFloat(planetFormCoordY.value).toFixed(2));
  const link = planetFormLink.value.trim() || 'https://www.sarna.net/wiki/';

  if (name.length <= 0) {
    toastHandler.createAndShowToast(
      'Error',
      "Name can't be empty",
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
    name !== currentEditPlanet?.name &&
    planets.filter((planet) => planet.name === name).length > 0
  ) {
    toastHandler.createAndShowToast(
      'Error',
      'You cannot create or update a planet with/to the same name as an existing planet.',
      ToastType.Danger
    );
    return;
  }

  if (
    planets.filter(
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
        id: id,
        x: x,
        y: y,
        link: link,
        name: name,
      })
      .then((planet) => {
        toastHandler.createAndShowToast(
          'Planet',
          'Planet created',
          ToastType.Info
        );
        planetTable.addData(planetDataToPlanetCoordData(planet));
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      );
  } else {
    // Update planet
    // Updating this objects updates the table, because of the data binding used with the table
    currentEditPlanet.id = id;
    currentEditPlanet.name = name;
    currentEditPlanet.coord.x = x;
    currentEditPlanet.coord.y = y;
    currentEditPlanet.link = link;
    window.sql
      .updatePlanet(
        JSON.parse(
          JSON.stringify(planetCoordDataToPlanetData(currentEditPlanet))
        )
      )
      .then(() => {
        toastHandler.createAndShowToast(
          'Planet',
          'Planet updated',
          ToastType.Info
        );
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      );
  }
  planetModal.hide();
});

function setPlanetFormData(planet: PlanetCoordData) {
  planetFormID.value = String(planet?.id || -1);
  planetFormName.value = planet?.name || '';
  planetFormCoordX.value = String(planet?.coord?.x || 0);
  planetFormCoordY.value = String(planet?.coord?.y || 0);
  planetFormLink.value = planet?.link || '';
}

function openPlanetModalWith(planet: PlanetCoordData = undefined) {
  currentEditPlanet = planet;
  setPlanetFormData(planet);
  planetModal.show();
}

// planet age copy modal and form setups
planetAgeCopyForm.addEventListener('submit', (e) => e.preventDefault());

const planetAgeCopyModal = new Modal(planetAgeCopyModalElement, {});

function openPlanetAgeCopyModal() {
  const ages = planetAffiliationAges.reduce(
    (acc, obj) => acc.add(obj.universeAge),
    new Set<number>()
  );

  // clear age selection element to add the current existing one
  planetAgeCopyFormTarget.innerHTML = '';

  for (const age of ages) {
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

  const destinationDataPoints = planetAffiliationAges.filter(
    (data) => data.universeAge === destinationAge
  );
  const targetDataPoints = planetAffiliationAges
    .filter(
      (data) =>
        data.universeAge === targetAge &&
        destinationDataPoints.filter(
          (destData) => destData.planetID === data.planetID
        ).length <= 0
    )
    .map((data) => {
      return {
        planetID: data.planetID,
        affiliationID: data.affiliationID,
        planetText: data.planetText,
        universeAge: destinationAge,
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
      planetAffiliationAgeTable.addData(
        dataPoints.map((data) => {
          return {
            ...data,
            planetName: planets.find((planet) => planet.id === data.planetID)
              .name,
            affiliationName: affiliations.find(
              (affiliations) => affiliations.id === data.affiliationID
            ).name,
          } as PlanetAffiliationAgeWithNamesData;
        })
      );
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
    affiliations.filter((affiliation) => affiliation.name === name).length > 0
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
        id: id,
        name: name,
        color: color,
      })
      .then((affiliation) => {
        toastHandler.createAndShowToast(
          'Affiliation',
          'Affiliation created',
          ToastType.Info
        );
        affiliationTable.addData(affiliation);
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      );
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
      );
  }
  affiliationModal.hide();
});

function openAffiliationModalWith(affiliation: AffiliationData = undefined) {
  currentEditAffiliation = affiliation;
  setAffiliationFormData(affiliation);
  affiliationModal.show();
}

function setAffiliationFormData(affiliation: AffiliationData) {
  affiliationFormID.value = String(affiliation?.id || -1);
  affiliationFormName.value = affiliation?.name || '';
  affiliationFormColor.value = affiliation?.color || '';
}

// planet affiliation age modal and form setups
let editPlanetAffiliationAgeData: PlanetAffiliationAgeWithNamesData = undefined;

const planetAffiliationAgeModal = new Modal(
  planetAffiliationAgeModalElement,
  {}
);

planetAffiliationAgeForm.addEventListener('submit', (e) => e.preventDefault());

planetAffiliationAgeSaveBtn.addEventListener('click', () => {
  const planetID = Number(planetAffiliationAgePlanetID.value);
  const affiliationID = Number(planetAffiliationAgeAffiliationID.value);
  const universeAge = Number(
    parseFloat(planetAffiliationAgeUniverseAge.value).toFixed(0)
  );
  const planetText = planetAffiliationAgePlanetText.value;

  if (isNaN(universeAge)) {
    toastHandler.createAndShowToast(
      'Error',
      'Universe age cant be undefined',
      ToastType.Danger
    );
    return;
  }

  if (editPlanetAffiliationAgeData) {
    editPlanetAffiliationAgeData.affiliationID = affiliationID;
    editPlanetAffiliationAgeData.planetText = planetText;
    editPlanetAffiliationAgeData.affiliationName = affiliations.find(
      (affiliation) => affiliation.id === affiliationID
    )?.name;
    window.sql
      .updatePlanetAffiliationAge(
        JSON.parse(JSON.stringify(editPlanetAffiliationAgeData))
      )
      .then(() => {
        toastHandler.createAndShowToast(
          'Planet Affiliation Connect',
          'Data updated',
          ToastType.Info
        );
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      );
  } else {
    // create
    if (
      planetAffiliationAges.filter(
        (data) => data.planetID === planetID && data.universeAge === universeAge
      ).length > 0
    ) {
      toastHandler.createAndShowToast(
        'Error',
        `The planet with id ${planetID} is already in the universe age ${universeAge}`,
        ToastType.Danger
      );
      return;
    }
    window.sql
      .createPlanetAffiliationAge({
        affiliationID: affiliationID,
        planetID: planetID,
        planetText: planetText,
        universeAge: universeAge,
      })
      .then((data) => {
        planetAffiliationAgeTable.addData({
          ...data,
          affiliationName: affiliations.find(
            (affiliation) => affiliation.id === data.affiliationID
          )?.name,
          planetName: planets.find((planet) => planet.id === data.planetID)
            ?.name,
        });
        toastHandler.createAndShowToast(
          'Planet Affiliation Connect',
          'Data created',
          ToastType.Info
        );
      })
      .catch((reason) =>
        toastHandler.createAndShowToast('Error', reason, ToastType.Danger)
      );
  }
  planetAffiliationAgeModal.hide();
});

function openPlanetAffiliationAgeModalWith(
  data: PlanetAffiliationAgeWithNamesData = undefined
) {
  editPlanetAffiliationAgeData = data;
  addAllPlanetsToSelect();
  addAllAffiliationsToSelect();
  setPlanetAffiliationAgeFormData(data);
  planetAffiliationAgeModal.show();
}

function setPlanetAffiliationAgeFormData(
  data: PlanetAffiliationAgeWithNamesData
) {
  planetAffiliationAgePlanetID.value = String(data?.planetID || 1);
  planetAffiliationAgeAffiliationID.value = String(data?.affiliationID || 0);
  planetAffiliationAgeUniverseAge.value = String(data?.universeAge || 3025);
  planetAffiliationAgePlanetText.value = data?.planetText || '';

  planetAffiliationAgePlanetID.disabled = data != undefined;
  planetAffiliationAgeUniverseAge.disabled = data != undefined;
}
/**
 * Add all affiliations to the affiliation id select element
 */
function addAllAffiliationsToSelect() {
  // clear affiliation id select
  planetAffiliationAgeAffiliationID.innerHTML = '';

  // add all affiliations from list (list will be updated, iff a affiliation is added or removed or updated via the affiliations table)
  for (const affiliation of affiliations.sort((a1, a2) =>
    a1.name > a2.name ? 1 : -1
  )) {
    const affiliationOption = document.createElement('option');
    affiliationOption.value = String(affiliation.id);
    affiliationOption.textContent = affiliation.name;
    planetAffiliationAgeAffiliationID.appendChild(affiliationOption);
  }
}

/**
 * Add all affiliations to the affiliation id select element
 */
function addAllPlanetsToSelect() {
  // clear affiliation id select
  planetAffiliationAgePlanetID.innerHTML = '';

  // add all affiliations from list (list will be updated, iff a affiliation is added or removed or updated via the affiliations table)
  for (const planet of planets.sort((p1, p2) => (p1.name > p2.name ? 1 : -1))) {
    const affiliationOption = document.createElement('option');
    affiliationOption.value = String(planet.id);
    affiliationOption.textContent = planet.name;
    planetAffiliationAgePlanetID.appendChild(affiliationOption);
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
        'active',
      ],
      onClick() {
        affiliationTable.remove();
        planetAffiliationAgeTable.remove();
        planetTable.render();
      },
    },
    {
      text: 'Affiliations',
      icon: affiliationIcon,
      classNames: ['nav-link', 'link-dark', 'align-items-center', 'd-flex'],
      onClick() {
        planetTable.remove();
        planetAffiliationAgeTable.remove();
        affiliationTable.render();
      },
    },
    {
      text: 'Planet Affiliation Connect',
      icon: planetAffiliationAgeIcon,
      classNames: ['nav-link', 'link-dark', 'align-items-center', 'd-flex'],
      onClick() {
        planetTable.remove();
        affiliationTable.remove();
        planetAffiliationAgeTable.render();
      },
    },
  ],
  'active'
);
tabGroup.render();

// Dialog setup

const dynamicDialog = new Dialog(dialogContainer);

// planet table
const planetTable = new Table<(typeof planets)[number]>(
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
          openPlanetModalWith();
        },
      },
    ],
  },
  [
    { name: 'Planet-ID', dataAttribute: 'id', size: 'col-1' },
    { name: 'Name', dataAttribute: 'name', size: 'col-3' },
    {
      name: 'Coordinates',
      dataAttribute: 'coord',
      size: 'col-3',
      formatter(value: { x: number; y: number }) {
        return value.x + ' / ' + value.y;
      },
    },
    { name: 'Link', dataAttribute: 'link', size: 'col-3' },
    {
      name: 'Action',
      size: 'col-2',
      buttons: [
        {
          icon: editIcon,
          classNames:
            'btn btn-primary btn-sm align-items-center p-1 me-1'.split(' '),
          onClick(data) {
            openPlanetModalWith(data);
          },
        },
        {
          icon: deleteIcon,
          classNames: 'btn btn-danger btn-sm align-items-center p-1'.split(' '),
          onClick(data, rowIdx) {
            dynamicDialog.show(
              {
                title: 'Delete Planet?',
                classNames: ['fs-5'],
              },
              {
                content: `Do you want to delete the planet '${data.name}?`,
              },
              {
                buttons: [
                  {
                    text: 'Ok',
                    classNames: ['btn', 'btn-primary', 'ms-auto', 'me-1'],
                    onClick() {
                      window.sql
                        .deletePlanet(JSON.parse(JSON.stringify(data)))
                        .then(() => {
                          dynamicDialog.hide();
                          planetTable.removeDataByIdx(rowIdx);
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
                    },
                  },
                  {
                    text: 'Cancel',
                    classNames: ['btn', 'btn-secondary'],
                    onClick() {
                      dynamicDialog.hide();
                    },
                  },
                ],
              }
            );
          },
        },
      ],
    },
  ]
);

// affiliation table
const affiliationTable = new Table<(typeof affiliations)[number]>(
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
          openAffiliationModalWith();
        },
      },
    ],
  },
  [
    { name: 'ID', dataAttribute: 'id', size: 'col-1' },
    { name: 'Name', dataAttribute: 'name', size: 'col-2' },
    {
      name: 'Color',
      dataAttribute: 'color',
      size: 'col-2',
    },
    {
      name: 'Action',
      size: 'col-1',
      buttons: [
        {
          icon: editIcon,
          classNames:
            'btn btn-primary btn-sm align-items-center p-1 me-1'.split(' '),
          onClick(data) {
            openAffiliationModalWith(data);
          },
        },
        {
          icon: deleteIcon,
          classNames: 'btn btn-danger btn-sm align-items-center p-1'.split(' '),
          onClick(data, rowIdx) {
            dynamicDialog.show(
              {
                title: 'Delete Affiliation?',
                classNames: ['fs-5'],
              },
              {
                content: `Do you want to delete the affiliation '${data.name}?`,
              },
              {
                buttons: [
                  {
                    text: 'Ok',
                    classNames: ['btn', 'btn-primary', 'ms-auto', 'me-1'],
                    onClick() {
                      window.sql
                        .deleteAffiliation(data)
                        .then(() => {
                          dynamicDialog.hide();
                          affiliationTable.removeDataByIdx(rowIdx);
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
                    },
                  },
                  {
                    text: 'Cancel',
                    classNames: ['btn', 'btn-secondary'],
                    onClick() {
                      dynamicDialog.hide();
                    },
                  },
                ],
              }
            );
          },
          enabled(data) {
            return data.id != 0;
          },
        },
      ],
    },
  ]
);

// planet affiliatoon age table
const planetAffiliationAgeTable = new Table<PlanetAffiliationAgeWithNamesData>(
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
          openPlanetAffiliationAgeModalWith();
        },
      },
      {
        icon: copyIcon,
        classNames: ['btn', 'btn-sm', 'btn-warning', 'me-2'],
        onClick() {
          openPlanetAgeCopyModal();
        },
      },
    ],
  },
  [
    {
      name: 'Planet-ID',
      size: 'col-1',
      dataAttribute: 'planetID',
    },
    {
      name: 'Planet Name',
      size: 'col-2',
      dataAttribute: 'planetName',
    },
    {
      name: 'Affiliation-ID',
      size: 'col-1',
      dataAttribute: 'affiliationID',
    },
    {
      name: 'Affiliation Name',
      size: 'col-2',
      dataAttribute: 'affiliationName',
    },
    {
      name: 'Universe Age',
      size: 'col-1',
      dataAttribute: 'universeAge',
    },
    {
      name: 'Planet Text',
      size: 'col-3',
      dataAttribute: 'planetText',
    },
    {
      name: 'Actions',
      size: 'col-2',
      buttons: [
        {
          icon: editIcon,
          classNames: ['btn', 'btn-sm', 'btn-primary', 'me-1', 'p-1'],
          onClick(data) {
            openPlanetAffiliationAgeModalWith(data);
          },
        },
        {
          icon: deleteIcon,
          classNames: ['btn', 'btn-sm', 'btn-danger', 'me-1', 'p-1'],
          onClick(data, rowIdx) {
            dynamicDialog.show(
              {
                title: 'Delete Planet Affiliation Connection?',
                classNames: ['fs-5'],
              },
              {
                content: `Do you want to delete the data point?`,
              },
              {
                buttons: [
                  {
                    text: 'Ok',
                    classNames: ['btn', 'btn-primary', 'ms-auto', 'me-1'],
                    onClick() {
                      window.sql
                        .deletePlanetAffiliationAge(data)
                        .then(() => {
                          dynamicDialog.hide();
                          planetAffiliationAgeTable.removeDataByIdx(rowIdx);
                          toastHandler.createAndShowToast(
                            'Planet Affiliation Connection',
                            'Data deleted',
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
                    },
                  },
                  {
                    text: 'Cancel',
                    classNames: ['btn', 'btn-secondary'],
                    onClick() {
                      dynamicDialog.hide();
                    },
                  },
                ],
              }
            );
          },
        },
      ],
    },
  ]
);

// Set data to table
planetTable.setData(planets);
affiliationTable.setData(affiliations);
planetAffiliationAgeTable.setData(planetAffiliationAges);

// Start dashboard with planet table
planetTable.render();
