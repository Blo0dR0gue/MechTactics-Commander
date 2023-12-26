// Init file for the dashboard page

// Import custom CSS to load bootstrap and override variables
import { Modal } from 'bootstrap';
import { AffiliationRequest } from '../types/AffiliationData';
import { PlanetRequest } from '../types/PlanetData';
import { Concrete } from '../types/UtilityTypes';
import './styles/main.scss';
import { Table } from './utils/Table';
import { createSVGElementFromString } from './utils/Utils';

// get planet and affiliation data
const affiliations: AffiliationRequest[] = await window.sql
  .getAllAffiliations()
  .then((data) => data.map((obj) => obj as Concrete<typeof obj>));

const planets: PlanetRequest[] = await window.sql.getAllPlanets().then((data) =>
  data.map(
    // move x and y coordinate to separate object inside an planet request object
    ({ x, y, ...rest }) =>
      ({
        ...rest,
        coordinates: { x, y },
      } as Concrete<PlanetRequest>)
  )
);

// element definitions
const tableParent = document.getElementById('table-holder');
const planetTab = document.getElementById('planet-tab');
const affiliationTab = document.getElementById('affiliation-tab');

const planetModalElement = document.getElementById('planet-modal');
const planetForm = document.getElementById('planet-form');
const planetSaveBtn = document.getElementById('planet-save');

const affiliationModalElement = document.getElementById('affiliation-modal');
const affiliationForm = document.getElementById('affiliation-form');
const affiliationSaveBtn = document.getElementById('affiliation-save');

// planet form elements
const planetFormID = document.getElementById('planet-id') as HTMLInputElement;
const planetFormName = document.getElementById(
  'planet-name'
) as HTMLInputElement;
const planetFormAffiliationID = document.getElementById(
  'planet-affiliation-id'
) as HTMLSelectElement;
const planetFormCoordX = document.getElementById(
  'planet-x'
) as HTMLInputElement;
const planetFormCoordY = document.getElementById(
  'planet-y'
) as HTMLInputElement;
const planetFormAge = document.getElementById('planet-age') as HTMLInputElement;
const planetFormLink = document.getElementById(
  'planet-link'
) as HTMLInputElement;
const planetFormText = document.getElementById(
  'planet-text'
) as HTMLTextAreaElement;

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

// planet form and modal setups
let currentEditPlanet: PlanetRequest = undefined;
const planetModal = new Modal(planetModalElement, {});

planetForm.addEventListener('submit', (e) => e.preventDefault());

planetSaveBtn.addEventListener('click', () => {
  const id = Number(planetFormID.value);
  const name = planetFormName.value;
  const affiliationID = Number(planetFormAffiliationID.value);
  const x = Number(planetFormCoordX.value);
  const y = Number(planetFormCoordY.value);
  const age = Number(planetFormAge.value);
  const link = planetFormLink.value;
  const text = planetFormText.value;
  if (currentEditPlanet === undefined) {
    // Create new planet
    window.sql.createPlanet({
      id: id,
      affiliationID: affiliationID,
      age: age,
      coordinates: { x: x, y: y },
      link: link,
      name: name,
      planetText: text,
    });
  } else {
    // Update planet
    currentEditPlanet.id = id;
    currentEditPlanet.name = name;
    currentEditPlanet.affiliationID = affiliationID;
    currentEditPlanet.coordinates.x = x;
    currentEditPlanet.coordinates.y = y;
    currentEditPlanet.age = age;
    currentEditPlanet.link = link;
    currentEditPlanet.planetText = text;
    window.sql.updatePlanet(JSON.parse(JSON.stringify(currentEditPlanet)));
  }
});

function setPlanetFormData(planet: PlanetRequest) {
  planetFormID.value = String(planet?.id || -1);
  planetFormName.value = planet?.name || '';
  planetFormAffiliationID.value = String(planet?.affiliationID || 1);
  planetFormCoordX.value = String(planet?.coordinates?.x || 0);
  planetFormCoordY.value = String(planet?.coordinates?.y || 0);
  planetFormAge.value = String(planet?.age || 3025);
  planetFormLink.value = planet?.link || '';
  planetFormText.value = planet?.planetText || '';

  // disabled fields on edit
  planetFormAffiliationID.disabled = planet !== undefined;
  planetFormAge.disabled = planet !== undefined;
}

function openPlanetModalWith(planet: PlanetRequest = undefined) {
  currentEditPlanet = planet;
  addAffiliationsToSelect();
  setPlanetFormData(planet);
  planetModal.show();
}

/**
 * Add all affiliations to the planet affiliation id select element
 */
function addAffiliationsToSelect() {
  // clear affiliation id select
  planetFormAffiliationID.innerHTML = '';

  // add all affiliations from list (list will be updated, iff a affiliation is added or removed or updated via the affiliations table)
  for (const affiliation of affiliations) {
    const affiliationOption = document.createElement('option');
    affiliationOption.value = String(affiliation.id);
    affiliationOption.textContent = affiliation.name;
    planetFormAffiliationID.appendChild(affiliationOption);
  }
}

// affiliation form and modal setups
let currentEditAffiliation: AffiliationRequest = undefined;

affiliationForm.addEventListener('submit', (e) => e.preventDefault());

const affiliationModal = new Modal(affiliationModalElement, {});

affiliationSaveBtn.addEventListener('click', () => {
  const id = Number(affiliationFormID.value);
  const name = affiliationFormName.value;
  const color = affiliationFormColor.value;
  if (currentEditAffiliation === undefined) {
    // Create new affiliation
    window.sql.createAffiliation({ id: id, name: name, color: color });
  } else {
    // Update affiliation
    currentEditAffiliation.id = id;
    currentEditAffiliation.name = name;
    currentEditAffiliation.color = color;
    window.sql.updateAffiliation(currentEditAffiliation);
  }
});

function openAffiliationModalWith(affiliation: AffiliationRequest = undefined) {
  currentEditAffiliation = affiliation;
  setAffiliationFormData(affiliation);
  affiliationModal.show();
}

function setAffiliationFormData(affiliation: AffiliationRequest) {
  affiliationFormID.value = String(affiliation?.id || -1);
  affiliationFormName.value = affiliation?.name || '';
  affiliationFormColor.value = affiliation?.color || '';
}

// tab setup
const tabs: HTMLElement[] = [];
tabs.push(planetTab);
tabs.push(affiliationTab);

// tab buttons setup
planetTab.addEventListener('click', () => {
  if (planetTab.classList.contains('active')) return;
  // Open planet table
  tabs.forEach((elem) => elem.classList.remove('active'));
  planetTab.classList.add('active');
  affiliationTable.remove();
  planetTable.render();
});

affiliationTab.addEventListener('click', () => {
  if (affiliationTab.classList.contains('active')) return;
  // open affiliation table
  tabs.forEach((elem) => elem.classList.remove('active'));
  affiliationTab.classList.add('active');
  planetTable.remove();
  affiliationTable.render();
});

// icon setup
const editBtnIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
</svg>`);

const deleteBtnIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg>`);

const addBtnIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
</svg>`);

// planet table
const planetTable = new Table<(typeof planets)[number]>(
  tableParent,
  'table table-striped table-hover user-select-none'.split(' '),
  20,
  {
    classNames:
      'navbar border-bottom d-flex justify-content-center bg-light sticky-top'.split(
        ' '
      ),
    searchBar: true,
    buttons: [
      {
        icon: addBtnIcon,
        classNames: ['btn', 'btn-success', 'btn-sm', 'me-1'],
        onClick() {
          openPlanetModalWith();
        },
      },
    ],
  },
  [
    { name: 'ID', dataAttribute: 'id', size: 'col-1' },
    { name: 'Name', dataAttribute: 'name', size: 'col-1' },
    {
      name: 'Coordinates',
      dataAttribute: 'coordinates',
      size: 'col-2',
      formatter(value: { x: number; y: number }) {
        return value.x + ' / ' + value.y;
      },
    },
    {
      name: 'Affiliation',
      dataAttribute: 'affiliationID',
      size: 'col-2',
      formatter(value) {
        return affiliations.find((obj) => obj.id == value).name;
      },
    },
    { name: 'Age', dataAttribute: 'age', size: 'col-1' },
    { name: 'Link', dataAttribute: 'link', size: 'col-2' },
    { name: 'Text', dataAttribute: 'planetText', size: 'col-2' },
    {
      name: 'Action',
      size: 'col-1',
      buttons: [
        {
          icon: editBtnIcon,
          classNames:
            'btn btn-primary btn-sm align-items-center p-1 me-1'.split(' '),
          onClick(data) {
            openPlanetModalWith(data);
          },
        },
        {
          icon: deleteBtnIcon,
          classNames: 'btn btn-danger btn-sm align-items-center p-1'.split(' '),
          onClick(data, rowIdx) {
            planetTable.removeDataByIdx(rowIdx);
            window.sql.deletePlanet(JSON.parse(JSON.stringify(data)));
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
  20,
  {
    classNames:
      'navbar border-bottom d-flex justify-content-center bg-light sticky-top'.split(
        ' '
      ),
    searchBar: true,
    buttons: [
      {
        icon: addBtnIcon,
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
          icon: editBtnIcon,
          classNames:
            'btn btn-primary btn-sm align-items-center p-1 me-1'.split(' '),
          onClick(data) {
            openAffiliationModalWith(data);
          },
        },
        {
          icon: deleteBtnIcon,
          classNames: 'btn btn-danger btn-sm align-items-center p-1'.split(' '),
          onClick(data, rowIdx) {
            affiliationTable.removeDataByIdx(rowIdx);
            window.sql.deleteAffiliation(data);
          },
          enabled(data) {
            return data.id != 0;
          },
        },
      ],
    },
  ]
);

// Set data to table
planetTable.setData(planets);
affiliationTable.setData(affiliations);

// Start dashboard with planet table
planetTable.render();
