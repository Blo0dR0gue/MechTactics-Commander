import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { PlanetData } from '../../types/PlanetData';
import { AffiliationData } from '../../types/AffiliationData';
import { PlanetAffiliationAgeData } from '../../types/PlanetAffiliationAge';
import { ForcefullyOmit } from '../../types/UtilityTypes';

contextBridge.exposeInMainWorld('sql', {
  getPlanetsAtAge: (age: string) => ipcRenderer.invoke('getPlanetsAtAge', age),
  getAllPlanets: () => ipcRenderer.invoke('getAllPlanets'),
  getAllAffiliations: () => ipcRenderer.invoke('getAllAffiliations'),
  getAllPlanetAffiliationAges: () =>
    ipcRenderer.invoke('getAllPlanetAffiliationAges'),
  getAllPlanetAffiliationAgesWithNames: () =>
    ipcRenderer.invoke('getAllPlanetAffiliationAgesWithNames'),
  getAllUniverseAges: () => ipcRenderer.invoke('getAllUniverseAges'),

  updatePlanet: (planet: PlanetData) =>
    ipcRenderer.invoke('updatePlanet', planet),
  createPlanet: (planet: ForcefullyOmit<PlanetData, 'id'>) =>
    ipcRenderer.invoke('createPlanet', planet),
  deletePlanet: (planetID: number) =>
    ipcRenderer.invoke('deletePlanet', planetID),

  updateAffiliation: (affiliation: AffiliationData) =>
    ipcRenderer.invoke('updateAffiliation', affiliation),
  createAffiliation: (affiliation: ForcefullyOmit<AffiliationData, 'id'>) =>
    ipcRenderer.invoke('createAffiliation', affiliation),
  deleteAffiliation: (affiliationID: number) =>
    ipcRenderer.invoke('deleteAffiliation', affiliationID),

  updatePlanetAffiliationAge: (data: PlanetAffiliationAgeData) =>
    ipcRenderer.invoke('updatePlanetAffiliationAge', data),
  createPlanetAffiliationAge: (data: PlanetAffiliationAgeData) =>
    ipcRenderer.invoke('createPlanetAffiliationAge', data),
  createPlanetAffiliationAges: (dataPoints: PlanetAffiliationAgeData[]) =>
    ipcRenderer.invoke('createPlanetAffiliationAges', dataPoints),
  deletePlanetAffiliationAge: (data: PlanetAffiliationAgeData) =>
    ipcRenderer.invoke('deletePlanetAffiliationAge', data),
});

contextBridge.exposeInMainWorld('app', {
  version: async () => {
    const response = await ipcRenderer.invoke('getAppData');
    return response.version;
  },
  setConfigData: (key: string, value: unknown) => {
    ipcRenderer.invoke('setConfigData', key, value);
  },
  getConfigCache: async () => {
    const cache = await ipcRenderer.invoke('getConfigCache');
    return cache;
  },

  exportTableToCSV: (tableName) =>
    ipcRenderer.invoke('exportTableToCSV', tableName),
  importTableFromCSV: (tableName) =>
    ipcRenderer.invoke('importTableFromCSV', tableName),
  exportDatabaseToCSVs: () => ipcRenderer.invoke('exportDatabaseToCSV'),
  importDatabaseFromCSVs: () => ipcRenderer.invoke('importDatabaseFromCSV'),
});

contextBridge.exposeInMainWorld('update', {
  addDownloadProgressListener: (
    callback: (event: IpcRendererEvent, percent: number) => void
  ) => ipcRenderer.on('updatePercentage', callback),
  addUpdateTextListener: (
    callback: (event: IpcRendererEvent, text: string, finished: boolean) => void
  ) => ipcRenderer.on('updateText', callback),
  addUpdateTitleListener: (
    callback: (event: IpcRendererEvent, text: string) => void
  ) => ipcRenderer.on('updateTitle', callback),
  restartAndUpdate: () => ipcRenderer.invoke('restartAndUpdate'),
});
