import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('app', {
  addDownloadProgressListener: (
    callback: (event: IpcRendererEvent, percent: number) => void
  ) => ipcRenderer.on('updatePercentage', callback),
  addUpdateTextListener: (
    callback: (event: IpcRendererEvent, text: string, finished: boolean) => void
  ) => ipcRenderer.on('updateText', callback),
  restartAndUpdate: () => ipcRenderer.invoke('restartAndUpdate'),
});
