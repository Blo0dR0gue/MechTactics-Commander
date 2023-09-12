import { Universe } from './models/Universe';

const canvasElement = document.getElementById('universe') as HTMLCanvasElement;

const universe = new Universe(canvasElement);

universe.init();
