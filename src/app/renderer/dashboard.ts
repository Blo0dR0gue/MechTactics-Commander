// Init file for the dashboard page

// TODO: Update the dynamic modal to also hold forms
// TODO: Short this file
// TODO: Cleanup (PRIO!!!)

// Import custom CSS to load bootstrap and override variables
import { Modal } from 'bootstrap';
import './styles/main.scss';
import { Table } from './utils/components/table/Table';
import {
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
import {
  addIcon,
  affiliationIcon,
  copyIcon,
  deleteIcon,
  editIcon,
  planetAffiliationAgeIcon,
  planetIcon,
} from './utils/Icons';
import { CoordStringFormatter } from './utils/components/formatter/CoordStringFormatter';

type DynamicPlanetAffiliationConnectData = {
  planetID: number;
  planetName: string;
  affiliationData: {
    [key: `age${number}`]: {
      universeAge: number;
      affiliationID: number;
      planetText: string;
      affiliationName: string;
    };
  };
};

// get planet and affiliation data
const affiliationsData: AffiliationData[] =
  await window.sql.getAllAffiliations();

const planetsData: PlanetCoordData[] = await window.sql
  .getAllPlanets()
  .then((data) => data.map((planet) => planetDataToPlanetCoordData(planet)));

// TODO: Remove mapping of the data with the names of the planet or affiliation. This is because the formatter on the table was to slow while searching. this needs to be optimized

const tmpPlanetAffiliationAgeData: PlanetAffiliationAgeWithNamesData[] =
  await window.sql.getAllPlanetAffiliationAgesWithNames();

const planetAffiliationConnectMap = new Map<
  number,
  DynamicPlanetAffiliationConnectData
>();

// TODO: Customer wants to have a smaller table where each planet is only once in the Planet Affiliation Connect table.
const currentUsedUniverseAges = await window.sql
  .getAllUniverseAges()
  .then((universeAges) =>
    universeAges.reduce((acc, age) => {
      acc.add(age.universeAge);
      return acc;
    }, new Set<number>())
  );

tmpPlanetAffiliationAgeData.forEach((planetAffiliationAge) => {
  let item = planetAffiliationConnectMap.get(planetAffiliationAge.planetID);
  const key = `age${planetAffiliationAge.universeAge}` as `age${number}`;
  const affiliationData = {
    universeAge: planetAffiliationAge.universeAge,
    affiliationID: planetAffiliationAge.affiliationID,
    planetText: planetAffiliationAge.planetText,
    affiliationName: planetAffiliationAge.affiliationName,
  };
  if (!item) {
    item = {
      planetID: planetAffiliationAge.planetID,
      planetName: planetAffiliationAge.planetName,
      affiliationData: {},
    };

    currentUsedUniverseAges.forEach((age) => {
      item.affiliationData[`age${age}`] = {
        affiliationID: undefined,
        affiliationName: undefined,
        planetText: undefined,
        universeAge: undefined,
      };
    });

    planetAffiliationConnectMap.set(planetAffiliationAge.planetID, item);
  }

  item.affiliationData[key] = affiliationData;
});
const planetAffiliationConnectData: DynamicPlanetAffiliationConnectData[] =
  Array.from(planetAffiliationConnectMap.values());

// icon setup

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
  'planet-affiliation-age-modal'
);
const planetAffiliationConnectForm = document.getElementById(
  'planet-affiliation-age-form'
);
const planetAffiliationConnectSaveBtn = document.getElementById(
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
  'planet-affiliation-age-planet-id'
) as HTMLSelectElement;
const planetAffiliationConnectAffiliationID = document.getElementById(
  'planet-affiliation-age-affiliation-id'
) as HTMLSelectElement;
const planetAffiliationConnectUniverseAge = document.getElementById(
  'planet-affiliation-age-universe-age'
) as HTMLInputElement;
const planetAffiliationConnectPlanetText = document.getElementById(
  'planet-affiliation-age-planet-text'
) as HTMLTextAreaElement;

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
        return (
          age && // is the age set
          age === targetAge && // and the age is the same as the target age
          // and are not already in the destination planets
          destinationDataPoints.filter(
            (destData) => destData.planetID === data.planetID
          ).length <= 0
        );
      }
    })
    .map((data) => {
      // Map the data points to the PlanetAffiliationAgeData, which is supported by the backend
      return {
        planetID: data.planetID,
        affiliationID: data.affiliationData[`age${targetAge}`].affiliationID,
        planetText: data.affiliationData[`age${targetAge}`].planetText,
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
      // Add the new data points to the already existing planet affiliation connect data points with the "new" universe age
      dataPoints.forEach((data) => {
        planetAffiliationConnectMap.get(data.planetID).affiliationData[
          `age${data.universeAge}`
        ] = {
          universeAge: data.universeAge,
          affiliationID: data.affiliationID,
          planetText: data.planetText,
          affiliationName: planetAffiliationConnectMap.get(data.planetID)
            .affiliationData[`age${targetAge}`].affiliationName, // We can get the name from the original object
        };
      });

      // Add the new universe age columns
      addUniverseAgeColumnsToPlanetAffiliationConnectTable(destinationAge);

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
    affiliationsData.filter((affiliation) => affiliation.name === name).length >
    0
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

// planet affiliation connect modal and form setups
let editPlanetAffiliationConnectData: DynamicPlanetAffiliationConnectData =
  undefined;

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
  const universeAge = Number(
    parseFloat(planetAffiliationConnectUniverseAge.value).toFixed(0)
  );
  const planetText = planetAffiliationConnectPlanetText.value;

  if (isNaN(universeAge)) {
    toastHandler.createAndShowToast(
      'Error',
      'Universe age cant be undefined',
      ToastType.Danger
    );
    return;
  }

  if (editPlanetAffiliationConnectData) {
    editPlanetAffiliationConnectData.affiliationID = affiliationID;
    editPlanetAffiliationConnectData.planetText = planetText;
    editPlanetAffiliationConnectData.affiliationName = affiliationsData.find(
      (affiliation) => affiliation.id === affiliationID
    )?.name;
    window.sql
      .updatePlanetAffiliationAge(
        JSON.parse(JSON.stringify(editPlanetAffiliationConnectData))
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
      tmpPlanetAffiliationAgeData.filter(
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
        planetAffiliationConnectTable.addData({
          ...data,
          affiliationName: affiliationsData.find(
            (affiliation) => affiliation.id === data.affiliationID
          )?.name,
          planetName: planetsData.find((planet) => planet.id === data.planetID)
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
  planetAffiliationConnectModal.hide();
});

function openPlanetAffiliationConnectModalWith(
  data: DynamicPlanetAffiliationConnectData = undefined
) {
  editPlanetAffiliationConnectData = data;
  addAllPlanetsToSelect();
  addAllAffiliationsToSelect();
  setPlanetAffiliationConnectFormData(data);
  planetAffiliationConnectModal.show();
}

function setPlanetAffiliationConnectFormData(
  data: DynamicPlanetAffiliationConnectData
) {
  planetAffiliationConnectPlanetID.value = String(data?.planetID || 1);
  planetAffiliationConnectAffiliationID.value = String(
    data?.affiliationID || 0
  );
  planetAffiliationConnectUniverseAge.value = String(data?.universeAge || 3025);
  planetAffiliationConnectPlanetText.value = data?.planetText || '';

  planetAffiliationConnectPlanetID.disabled = data != undefined;
  planetAffiliationConnectUniverseAge.disabled = data != undefined;
}
/**
 * Add all affiliations to the affiliation id select element
 */
function addAllAffiliationsToSelect() {
  // clear affiliation id select
  planetAffiliationConnectAffiliationID.innerHTML = '';

  // add all affiliations from list (list will be updated, iff a affiliation is added or removed or updated via the affiliations table)
  for (const affiliation of affiliationsData.sort((a1, a2) =>
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
function addAllPlanetsToSelect() {
  // clear affiliation id select
  planetAffiliationConnectPlanetID.innerHTML = '';

  // add all affiliations from list (list will be updated, iff a affiliation is added or removed or updated via the affiliations table)
  for (const planet of planetsData.sort((p1, p2) =>
    p1.name > p2.name ? 1 : -1
  )) {
    const affiliationOption = document.createElement('option');
    affiliationOption.value = String(planet.id);
    affiliationOption.textContent = planet.name;
    planetAffiliationConnectPlanetID.appendChild(affiliationOption);
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
        planetAffiliationConnectTable.remove();
        planetTable.render();
      },
    },
    {
      text: 'Affiliations',
      icon: affiliationIcon,
      classNames: ['nav-link', 'link-dark', 'align-items-center', 'd-flex'],
      onClick() {
        planetTable.remove();
        planetAffiliationConnectTable.remove();
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
        planetAffiliationConnectTable.render();
      },
    },
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
          openPlanetModalWith();
        },
      },
    ],
  },
  [
    {
      header: { name: 'Planet-ID', size: 'col-1' },
      data: { type: 'binding', dataAttribute: 'id' },
    },
    {
      header: { name: 'Name', size: 'col-3' },
      data: { type: 'binding', dataAttribute: 'name' },
    },
    {
      header: { name: 'Coordinates', size: 'col-3' },
      data: {
        type: 'binding',
        dataAttribute: 'coord',
        formatter: new CoordStringFormatter(),
      },
    },
    {
      header: {
        name: 'Link',
        size: 'col-3',
      },
      data: {
        type: 'binding',
        dataAttribute: 'link',
      },
    },
    {
      header: {
        name: 'Action',
        size: 'col-2',
      },
      data: {
        type: 'button',
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
            classNames: 'btn btn-danger btn-sm align-items-center p-1'.split(
              ' '
            ),
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
    },
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
          openAffiliationModalWith();
        },
      },
    ],
  },
  [
    {
      header: { name: 'ID', size: 'col-1' },
      data: { type: 'binding', dataAttribute: 'id' },
    },
    {
      header: { name: 'Name', size: 'col-2' },
      data: { type: 'binding', dataAttribute: 'name' },
    },
    {
      header: {
        name: 'Color',
        size: 'col-2',
      },
      data: {
        type: 'binding',
        dataAttribute: 'color',
      },
    },
    {
      header: {
        name: 'Action',
        size: 'col-1',
      },
      data: {
        type: 'button',
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
            classNames: 'btn btn-danger btn-sm align-items-center p-1'.split(
              ' '
            ),
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
    },
  ]
);

// planet affiliation connect table

function addUniverseAgeColumnsToPlanetAffiliationConnectTable(
  universeAge: number
) {
  planetAffiliationConnectTable.addColumnAt(
    {
      header: { name: 'Affiliation ID ' + universeAge, size: 'col-2' },
      data: {
        type: 'binding',
        dataAttribute: `affiliationData.age${universeAge}.affiliationID`,
      },
    },
    planetAffiliationConnectTable.getColumns().length - 1
  );
  planetAffiliationConnectTable.addColumnAt(
    {
      header: { name: 'Affiliation Name ' + universeAge, size: 'col-2' },
      data: {
        type: 'binding',
        dataAttribute: `affiliationData.age${universeAge}.affiliationName`,
      },
    },
    planetAffiliationConnectTable.getColumns().length - 1
  );
  planetAffiliationConnectTable.addColumnAt(
    {
      header: { name: 'Planet Text ' + universeAge, size: 'col-2' },
      data: {
        type: 'binding',
        dataAttribute: `affiliationData.age${universeAge}.planetText`,
      },
    },
    planetAffiliationConnectTable.getColumns().length - 1
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
            openPlanetAffiliationConnectModalWith();
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
        header: {
          name: 'Planet-ID',
          size: 'col-1',
        },
        data: {
          type: 'binding',
          dataAttribute: 'planetID',
        },
      },
      {
        header: {
          name: 'Planet Name',
          size: 'col-2',
        },
        data: {
          type: 'binding',
          dataAttribute: 'planetName',
        },
      },
      {
        header: {
          name: 'Actions',
          size: 'col-2',
        },
        data: {
          type: 'button',
          buttons: [
            {
              icon: editIcon,
              classNames: ['btn', 'btn-sm', 'btn-primary', 'me-1', 'p-1'],
              onClick(data) {
                openPlanetAffiliationConnectModalWith(data);
              },
            },
          ],
        },
      },
    ]
  );

// Set data to table
planetTable.setData(planetsData);
affiliationTable.setData(affiliationsData);
planetAffiliationConnectTable.setData(planetAffiliationConnectData);

// Add all current active universe ages to the planet affiliation connection table
for (const universeAge of currentUsedUniverseAges) {
  addUniverseAgeColumnsToPlanetAffiliationConnectTable(universeAge);
}

// Start dashboard with planet table
planetTable.render();
