const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Set environment variables to prevent GPU errors
process.env.ELECTRON_DISABLE_GPU = '1';
process.env.ELECTRON_DISABLE_GPU_SANDBOX = '1';

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      hardwareAcceleration: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Disable GPU acceleration to prevent GPU errors
app.disableHardwareAcceleration();

// App event listeners
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for data persistence
const dataPath = path.join(app.getPath('userData'), 'pomodoro-data.json');

// Load data from file
ipcMain.handle('load-data', async () => {
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
    return { tasks: [], history: [], settings: { workTime: 25, breakTime: 5, longBreakTime: 15 } };
  } catch (error) {
    console.error('Error loading data:', error);
    return { tasks: [], history: [], settings: { workTime: 25, breakTime: 5, longBreakTime: 15 } };
  }
});

// Save data to file
ipcMain.handle('save-data', async (event, data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
});

// Export data
ipcMain.handle('export-data', async () => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Pomodoro Data',
      defaultPath: 'pomodoro-data.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      const data = fs.readFileSync(dataPath, 'utf8');
      fs.writeFileSync(result.filePath, data);
      return { success: true, path: result.filePath };
    }
    return { success: false };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: error.message };
  }
});

// Import data
ipcMain.handle('import-data', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Pomodoro Data',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const data = fs.readFileSync(result.filePaths[0], 'utf8');
      const parsedData = JSON.parse(data);
      fs.writeFileSync(dataPath, JSON.stringify(parsedData, null, 2));
      return { success: true, data: parsedData };
    }
    return { success: false };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
});

// Notification permission
ipcMain.handle('request-notification-permission', async () => {
  // In Electron, notifications are enabled by default
  return true;
});

// Show notification
ipcMain.handle('show-notification', async (event, { title, body, icon }) => {
  const { Notification } = require('electron');
  
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: icon || path.join(__dirname, 'assets', 'icon.png'),
      silent: false
    });
    
    notification.show();
    return true;
  }
  return false;
});
