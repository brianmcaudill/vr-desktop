import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

// Get the default workspace directory (where user's virtual files are mapped)
function getWorkspaceDirectory(): string {
  const userDataPath = app.getPath('userData');
  const workspacePath = path.join(userDataPath, 'workspace');

  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });
  }

  return workspacePath;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    titleBarStyle: 'default',
    show: false,
    autoHideMenuBar: true,
    title: 'VR Desktop',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4001');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupIPCHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIPCHandlers(): void {
  // Get app version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Get workspace directory
  ipcMain.handle('get-workspace-directory', () => {
    return getWorkspaceDirectory();
  });

  // List files in a directory
  ipcMain.handle('list-directory', async (_event, dirPath: string) => {
    try {
      const targetPath = dirPath || getWorkspaceDirectory();
      const entries = fs.readdirSync(targetPath, { withFileTypes: true });
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico'];

      return entries.map(entry => {
        const ext = entry.isFile() ? path.extname(entry.name).toLowerCase() : null;
        const isImage = ext ? imageExtensions.includes(ext) : false;
        const textExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.tsx', '.jsx', '.css', '.html', '.yml', '.yaml', '.xml', '.csv', '.log'];
        const isText = ext ? textExtensions.includes(ext) : false;
        let thumbnail: string | null = null;
        let preview: string | null = null;

        // Generate thumbnail for images
        if (isImage) {
          try {
            const filePath = path.join(targetPath, entry.name);
            const buffer = fs.readFileSync(filePath);
            const base64 = buffer.toString('base64');
            const mimeType = ext === '.png' ? 'image/png' :
                            ext === '.gif' ? 'image/gif' :
                            ext === '.bmp' ? 'image/bmp' :
                            ext === '.webp' ? 'image/webp' :
                            ext === '.ico' ? 'image/x-icon' :
                            'image/jpeg';
            thumbnail = `data:${mimeType};base64,${base64}`;
          } catch {
            // Failed to read image, leave thumbnail as null
          }
        }

        // Generate text preview for text files
        if (isText) {
          try {
            const filePath = path.join(targetPath, entry.name);
            const content = fs.readFileSync(filePath, 'utf-8');
            // Get first 500 characters for preview
            preview = content.substring(0, 500);
          } catch {
            // Failed to read text file
          }
        }

        return {
          name: entry.name,
          path: path.join(targetPath, entry.name),
          isDirectory: entry.isDirectory(),
          isFile: entry.isFile(),
          extension: ext,
          isImage,
          thumbnail,
          preview,
        };
      });
    } catch (error) {
      console.error('Failed to list directory:', error);
      return [];
    }
  });

  // Read file content
  ipcMain.handle('read-file', async (_event, filePath: string) => {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico'];

      // Check if it's an image file
      if (imageExtensions.includes(ext)) {
        const buffer = fs.readFileSync(filePath);
        const base64 = buffer.toString('base64');
        const mimeType = ext === '.svg' ? 'image/svg+xml' :
                        ext === '.png' ? 'image/png' :
                        ext === '.gif' ? 'image/gif' :
                        ext === '.bmp' ? 'image/bmp' :
                        ext === '.webp' ? 'image/webp' :
                        ext === '.ico' ? 'image/x-icon' :
                        'image/jpeg';

        return {
          success: true,
          content: `data:${mimeType};base64,${base64}`,
          name: path.basename(filePath),
          path: filePath,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          isImage: true,
        };
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      return {
        success: true,
        content,
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        isImage: false,
      };
    } catch (error) {
      console.error('Failed to read file:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Write file content
  ipcMain.handle('write-file', async (_event, filePath: string, content: string) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Failed to write file:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Create new file
  ipcMain.handle('create-file', async (_event, dirPath: string, fileName: string, content: string = '') => {
    try {
      const filePath = path.join(dirPath || getWorkspaceDirectory(), fileName);
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Failed to create file:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Delete file
  ipcMain.handle('delete-file', async (_event, filePath: string) => {
    try {
      fs.unlinkSync(filePath);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete file:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Open file dialog to select a directory to map
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
      title: 'Select a folder to view in your virtual world',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // Open file with system default application
  ipcMain.handle('open-file-external', async (_event, filePath: string) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      console.error('Failed to open file:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Get file stats
  ipcMain.handle('get-file-stats', async (_event, filePath: string) => {
    try {
      const stats = fs.statSync(filePath);
      return {
        success: true,
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
      };
    } catch (error) {
      console.error('Failed to get file stats:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Save world state (positions of objects, etc.)
  ipcMain.handle('save-world-state', async (_event, state: string) => {
    try {
      const statePath = path.join(app.getPath('userData'), 'world-state.json');
      fs.writeFileSync(statePath, state, 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Failed to save world state:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Load world state
  ipcMain.handle('load-world-state', async () => {
    try {
      const statePath = path.join(app.getPath('userData'), 'world-state.json');
      if (fs.existsSync(statePath)) {
        const content = fs.readFileSync(statePath, 'utf-8');
        return { success: true, state: content };
      }
      return { success: false, error: 'No saved state found' };
    } catch (error) {
      console.error('Failed to load world state:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}
