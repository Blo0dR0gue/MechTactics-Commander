import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sql', {
  planets: () => ipcRenderer.invoke('getAllPlanets'),
});

contextBridge.exposeInMainWorld('app', {
  version: async () => {
    const response = await ipcRenderer.invoke('getAppData');
    return response.version;
  },
});
