const { ipcRenderer } = require("electron");
import * as types from './types';

export const initialize = () => {
    ipcRenderer.invoke('initialize');
}

export const submitSQL = async (code: string, secondaryCode: string) => {
    const result: types.QueryResult = await ipcRenderer.invoke('submitSQL', code, secondaryCode);
    return result;
}

export const openFolderDialog = async (path: string) => {
    const result: string[] = await ipcRenderer.invoke('openFolderDialog', path);
    return result;
}

export const deployScript = async (path: string, code: string, settings: types.DeploySettings) => {
    const result: types.DeployResult = await ipcRenderer.invoke('deployScript', path, code, settings);
    return result;
}

export const deployBackend = async (path: string, code: string, settings: types.DeploySettings) => {
    const result: types.DeployResult = await ipcRenderer.invoke('deployBackend', path, code, settings);
    return result;
}