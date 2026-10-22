'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumiraDesktop', Object.freeze({
  getCognoscereStatus: () => ipcRenderer.invoke('lumira:cognoscere-status'),
  converseAboutProject: request => ipcRenderer.invoke('lumira:project-conversation', request),
  verifyApplicationKey: candidate => ipcRenderer.invoke('lumira:verify-application-key', candidate),
  isApplicationAuthenticated: () => ipcRenderer.invoke('lumira:application-authenticated'),
}));
