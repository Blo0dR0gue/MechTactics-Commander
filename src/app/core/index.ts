import { Universe } from './models/map/Universe';

const canvasElement = document.getElementById('universe') as HTMLCanvasElement;

const universe = new Universe(canvasElement);

universe.init();
