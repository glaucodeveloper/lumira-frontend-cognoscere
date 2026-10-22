'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumiraDesktop', Object.freeze({
  getCognoscereStatus: () => ipcRenderer.invoke('lumira:cognoscere-status'),
  converseAboutProject: request => ipcRenderer.invoke('lumira:project-conversation', request),
  verifyPresentationKey: candidate => ipcRenderer.invoke('lumira:verify-pta', candidate),
}));
