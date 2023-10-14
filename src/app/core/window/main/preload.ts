import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sql', {
  getAllPlanets: () => ipcRenderer.invoke('getAllPlanets'),
  getAllAffiliations: () => ipcRenderer.invoke('getAllAffiliations'),
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
});
