// Init file for the dashboard page

// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';
import { Table } from './utils/Table';
import { createSVGElementFromString } from './utils/Utils';

// element definitions
const tableParent = document.getElementById('table-holder');
const planetTab = document.getElementById('planet-tab');
const affiliationTab = document.getElementById('affiliation-tab');

const taps: HTMLElement[] = [];
taps.push(planetTab);
taps.push(affiliationTab);

// btn setup
planetTab.addEventListener('click', () => {
  if (planetTab.classList.contains('active')) return;
  taps.forEach((elem) => elem.classList.remove('active'));
  planetTab.classList.add('active');
  affiliationTable.remove();
  planetTable.render();
});

affiliationTab.addEventListener('click', () => {
  if (affiliationTab.classList.contains('active')) return;
  taps.forEach((elem) => elem.classList.remove('active'));
  affiliationTab.classList.add('active');
  planetTable.remove();
  affiliationTable.render();
});

// get all data
const affiliations = await window.sql.getAllAffiliations();
const planets = await window.sql.getAllPlanets().then((data) =>
  data.map(({ x, y, ...rest }) => ({
    ...rest,
    coordinates: { x, y },
  }))
);

const editBtnIcon =
  createSVGElementFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
</svg>`);

// planet table
const planetTable = new Table<(typeof planets)[number]>(
  tableParent,
  'table table-striped table-hover user-select-none'.split(' '),
  20,
  [
    { name: 'ID', dataAttribute: 'id', size: 'col-1' },
    { name: 'Name', dataAttribute: 'name', size: 'col-2' },
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
    { name: 'Text', dataAttribute: 'planetText', size: 'col-3' },
    {
      name: 'Action',
      size: 'col-1',
      buttons: [
        {
          icon: editBtnIcon,
          classNames:
            'btn btn-primary btn-sm align-items-center d-flex p-1'.split(' '),
          onClick(data, rowidx) {
            console.log(data, rowidx);
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
            'btn btn-primary btn-sm align-items-center d-flex p-1'.split(' '),
          onClick(data, rowidx) {
            console.log(data, rowidx);
          },
        },
      ],
    },
  ]
);

planetTable.setData(planets);
affiliationTable.setData(affiliations);

planetTable.render();
