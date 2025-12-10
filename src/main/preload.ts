import { contextBridge, ipcRenderer } from 'electron';

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  extension: string | null;
  isImage?: boolean;
  thumbnail?: string | null;
}

export interface FileContent {
  success: boolean;
  content?: string;
  name?: string;
  path?: string;
  size?: number;
  modified?: string;
  isImage?: boolean;
  error?: string;
}

export interface FileStats {
  success: boolean;
  size?: number;
  created?: string;
  modified?: string;
  isDirectory?: boolean;
  isFile?: boolean;
  error?: string;
}

export interface OperationResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface WorldStateResult {
  success: boolean;
  state?: string;
  error?: string;
}

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getWorkspaceDirectory: () => Promise<string>;
  listDirectory: (dirPath?: string) => Promise<FileEntry[]>;
  readFile: (filePath: string) => Promise<FileContent>;
  writeFile: (filePath: string, content: string) => Promise<OperationResult>;
  createFile: (dirPath: string, fileName: string, content?: string) => Promise<OperationResult>;
  deleteFile: (filePath: string) => Promise<OperationResult>;
  selectDirectory: () => Promise<string | null>;
  openFileExternal: (filePath: string) => Promise<OperationResult>;
  getFileStats: (filePath: string) => Promise<FileStats>;
  saveWorldState: (state: string) => Promise<OperationResult>;
  loadWorldState: () => Promise<WorldStateResult>;
}

const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getWorkspaceDirectory: () => ipcRenderer.invoke('get-workspace-directory'),
  listDirectory: (dirPath?: string) => ipcRenderer.invoke('list-directory', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  createFile: (dirPath: string, fileName: string, content?: string) => ipcRenderer.invoke('create-file', dirPath, fileName, content),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  openFileExternal: (filePath: string) => ipcRenderer.invoke('open-file-external', filePath),
  getFileStats: (filePath: string) => ipcRenderer.invoke('get-file-stats', filePath),
  saveWorldState: (state: string) => ipcRenderer.invoke('save-world-state', state),
  loadWorldState: () => ipcRenderer.invoke('load-world-state'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
