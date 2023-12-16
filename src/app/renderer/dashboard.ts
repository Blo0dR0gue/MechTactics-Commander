// Init file for the dashboard page

// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';
import { Table } from './utils/Table';

const tableParent = document.getElementById('table-holder');

// TODO: formatter for coordinates
const data = [
  {
    name: 'Terra',
    coordinates: '0 / 0',
    affiliation: 'Star',
    age: 3025,
    text: 'Moin',
  },
];

// TODO: Create factory
const svgCode = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
        </svg>
    `;

const parser = new DOMParser();
const svgDocument = parser.parseFromString(svgCode, 'image/svg+xml');

// Extract the SVG element from the document
const svgElement = svgDocument.documentElement as HTMLElement & SVGElement;

const planetTable = new Table<(typeof data)[number]>(
  tableParent,
  'table table-striped table-hover user-select-none'.split(' '),
  [
    { name: 'Name', dataAttribute: 'name', size: 'col-2' },
    { name: 'Coordinates', dataAttribute: 'coordinates', size: 'col-1' },
    { name: 'Affiliation', dataAttribute: 'affiliation', size: 'col-2' },
    { name: 'Age', dataAttribute: 'age', size: 'col-1' },
    { name: 'Text', dataAttribute: 'text', size: 'col-4' },
    {
      name: 'Action',
      size: 'col-2',
      buttons: [
        {
          icon: svgElement,
          classNames:
            'btn btn-primary btn-sm align-items-center d-flex p-1'.split(' '),
          onClick(data, rowidx) {
            data.age += rowidx;
            console.log(data, rowidx);
          },
        },
      ],
    },
  ]
);

planetTable.setData(data);

planetTable.render();
