const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');
// Use sql.js (WASM) instead of native better-sqlite3 to avoid build toolchain
const initSqlJs = require('sql.js');
let SQL = null; // set after init

// Set environment variables to prevent GPU errors
process.env.ELECTRON_DISABLE_GPU = '1';
process.env.ELECTRON_DISABLE_GPU_SANDBOX = '1';

// Keep a global reference of the window object
let mainWindow;
let overlayWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Remove the title bar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      hardwareAcceleration: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
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

// Overlay window management
function createOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    return overlayWindow;
  }
  overlayWindow = new BrowserWindow({
    width: 160,
    height: 160,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    focusable: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false
    }
  });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true);
  overlayWindow.loadFile('overlay.html');
  try {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winBounds = overlayWindow.getBounds();
    overlayWindow.setPosition(width - winBounds.width - 20, height - winBounds.height - 60);
  } catch {}
  overlayWindow.once('ready-to-show', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.showInactive();
    }
  });
  return overlayWindow;
}

ipcMain.handle('toggle-overlay', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
    } else {
      overlayWindow.showInactive();
    }
    return;
  }
  const win = createOverlayWindow();
  if (win && !win.isDestroyed()) {
    win.showInactive();
  }
});

// Receive timer ticks from renderer and forward to overlay
ipcMain.on('timer-tick', (_event, state) => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('timer-update', state);
  }
});

// IPC handlers for data persistence (sql.js)
const userDataDir = app.getPath('userData');
const dataPath = path.join(userDataDir, 'pomodoro-data.json');
const dbPath = path.join(userDataDir, 'pomodoro.db');
let db; // sql.js Database

function ensureUserDir() {
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
}

function saveDbToDisk() {
  if (!db) return;
  const binaryArray = db.export();
  const buffer = Buffer.from(binaryArray);
  fs.writeFileSync(dbPath, buffer);
  try {
    const stat = fs.statSync(dbPath);
  } catch {}
}

function exec(sql) {
  db.exec(sql);
}

function run(sql, params = {}) {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    while (stmt.step()) {
      // drain
    }
  } finally {
    stmt.free();
  }
}

function all(sql, params = {}) {
  const stmt = db.prepare(sql);
  const rows = [];
  try {
    stmt.bind(params);
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
  } finally {
    stmt.free();
  }
  return rows;
}

function getScalar(sql) {
  const rows = all(sql);
  if (rows.length === 0) return undefined;
  const obj = rows[0];
  const firstKey = Object.keys(obj)[0];
  return obj[firstKey];
}

async function initSqlDatabase() {
  ensureUserDir();
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file)
    });
  }
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(new Uint8Array(fileBuffer));
  } else {
    db = new SQL.Database();
  }

  exec(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS tasks(
      id INTEGER PRIMARY KEY,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      pomodoros INTEGER NOT NULL DEFAULT 0,
      targetPomodoros INTEGER,
      dueDate TEXT
    );
    CREATE TABLE IF NOT EXISTS history(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER,
      startedAt TEXT,
      endedAt TEXT,
      mode TEXT
    );
    CREATE TABLE IF NOT EXISTS settings(
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Ensure schema migrations for existing DBs
  try {
    const cols = all('PRAGMA table_info(tasks)');
    const hasTarget = cols.some(c => String(c.name) === 'targetPomodoros');
    if (!hasTarget) {
      exec('ALTER TABLE tasks ADD COLUMN targetPomodoros INTEGER');
      saveDbToDisk();
    }
  } catch (e) {
    console.warn('Schema check failed:', e);
  }

  // Migration from JSON if DB is empty
  const countTasks = Number(getScalar('SELECT COUNT(1) AS c FROM tasks')) || 0;
  const countSettings = Number(getScalar('SELECT COUNT(1) AS c FROM settings')) || 0;
  if (countTasks === 0 && countSettings === 0 && fs.existsSync(dataPath)) {
    try {
      const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      db.run('BEGIN');
      try {
        if (Array.isArray(json.tasks)) {
          const insertTask = db.prepare('INSERT INTO tasks(id, text, completed, createdAt, pomodoros) VALUES(@id, @text, @completed, @createdAt, @pomodoros)');
          for (const t of json.tasks) {
            insertTask.bind({
              '@id': t.id,
              '@text': t.text || '',
              '@completed': t.completed ? 1 : 0,
              '@createdAt': t.createdAt || new Date().toISOString(),
              '@pomodoros': t.pomodoros || 0
            });
            insertTask.step();
            insertTask.reset();
          }
          insertTask.free();
        }
        const s = json.settings || {};
        const defaults = { workTime: 25, breakTime: 5, longBreakTime: 15, longBreakInterval: 4, notificationsEnabled: false, autoStartBreaks: false };
        const merged = { ...defaults, ...s };
        const insertSetting = db.prepare('INSERT INTO settings(key, value) VALUES(@key, @value)');
        for (const [k, v] of Object.entries(merged)) {
          insertSetting.bind({ '@key': k, '@value': JSON.stringify(v) });
          insertSetting.step();
          insertSetting.reset();
        }
        insertSetting.free();
        if (Array.isArray(json.history)) {
          const insertHistory = db.prepare('INSERT INTO history(taskId, startedAt, endedAt, mode) VALUES(@taskId, @startedAt, @endedAt, @mode)');
          for (const h of json.history) {
            insertHistory.bind({
              '@taskId': h.taskId ?? null,
              '@startedAt': h.startedAt || null,
              '@endedAt': h.endedAt || null,
              '@mode': h.mode || null
            });
            insertHistory.step();
            insertHistory.reset();
          }
          insertHistory.free();
        }
        db.run('COMMIT');
        saveDbToDisk();
      } catch (e) {
        db.run('ROLLBACK');
        throw e;
      }
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }
  // Persist DB if it was newly created
  saveDbToDisk();
}

app.whenReady().then(async () => {
  await initSqlDatabase();
});

// Load data from file
ipcMain.handle('load-data', async () => {
  try {
    if (db) {
      const tasks = all('SELECT id, text, completed, createdAt, pomodoros, targetPomodoros, dueDate FROM tasks ORDER BY createdAt ASC')
        .map(t => ({ ...t, completed: !!t.completed }));
      const settingsRows = all('SELECT key, value FROM settings');
      const settings = {};
      for (const r of settingsRows) { settings[r.key] = JSON.parse(r.value); }
      const defaults = { workTime: 25, breakTime: 5, longBreakTime: 15, longBreakInterval: 4, notificationsEnabled: false, autoStartBreaks: false };
      const mergedSettings = { ...defaults, ...settings };
      const history = all('SELECT id, taskId, startedAt, endedAt, mode FROM history ORDER BY id DESC LIMIT 1000');
      return { tasks, history, settings: mergedSettings };
    }
    // Fallback to JSON
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
    return { tasks: [], history: [], settings: { workTime: 25, breakTime: 5, longBreakTime: 15, longBreakInterval: 4, notificationsEnabled: false, autoStartBreaks: false } };
  } catch (error) {
    console.error('Error loading data:', error);
    return { tasks: [], history: [], settings: { workTime: 25, breakTime: 5, longBreakTime: 15, longBreakInterval: 4, notificationsEnabled: false, autoStartBreaks: false } };
  }
});

// Save data to file
ipcMain.handle('save-data', async (event, data) => {
  try {
    if (db) {
      db.run('BEGIN');
      try {
        // Upsert tasks instead of full delete to avoid transient multi-delete effects
        exec('CREATE TABLE IF NOT EXISTS tasks_tmp(id INTEGER PRIMARY KEY, text TEXT, completed INTEGER, createdAt TEXT, pomodoros INTEGER, targetPomodoros INTEGER, dueDate TEXT)');
        run('DELETE FROM tasks_tmp');
        if (Array.isArray(data.tasks)) {
          const insertTaskTmp = db.prepare('INSERT INTO tasks_tmp(id, text, completed, createdAt, pomodoros, targetPomodoros, dueDate) VALUES(@id, @text, @completed, @createdAt, @pomodoros, @targetPomodoros, @dueDate)');
          for (const t of data.tasks) {
            insertTaskTmp.bind({
              '@id': t.id,
              '@text': t.text || '',
              '@completed': t.completed ? 1 : 0,
              '@createdAt': t.createdAt || new Date().toISOString(),
              '@pomodoros': t.pomodoros || 0,
              '@targetPomodoros': t.targetPomodoros ?? null,
              '@dueDate': t.dueDate || null
            });
            insertTaskTmp.step();
            insertTaskTmp.reset();
          }
          insertTaskTmp.free();
        }
        exec('DELETE FROM tasks');
        exec('INSERT INTO tasks SELECT * FROM tasks_tmp');
        run('DELETE FROM settings');
        if (data.settings) {
          const insertSetting = db.prepare('INSERT INTO settings(key, value) VALUES(@key, @value)');
          for (const [k, v] of Object.entries(data.settings)) {
            insertSetting.bind({ '@key': k, '@value': JSON.stringify(v) });
            insertSetting.step();
            insertSetting.reset();
          }
          insertSetting.free();
        }
        if (Array.isArray(data.history)) {
          run('DELETE FROM history');
          const insertHistory = db.prepare('INSERT INTO history(taskId, startedAt, endedAt, mode) VALUES(@taskId, @startedAt, @endedAt, @mode)');
          for (const h of data.history) {
            insertHistory.bind({
              '@taskId': h.taskId ?? null,
              '@startedAt': h.startedAt || null,
              '@endedAt': h.endedAt || null,
              '@mode': h.mode || null
            });
            insertHistory.step();
            insertHistory.reset();
          }
          insertHistory.free();
        }
        db.run('COMMIT');
        saveDbToDisk();
        // Extra sync to ensure OS flush finished before returning
        try { fs.closeSync(fs.openSync(dbPath, 'r')); } catch {}
        return true;
      } catch (e) {
        db.run('ROLLBACK');
        throw e;
      }
    }
    // fallback
    console.warn('Saving data to JSON fallback at', dataPath);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
});

// Utility: report DB path
ipcMain.handle('get-db-path', async () => {
  return { path: dbPath, exists: fs.existsSync(dbPath) };
});

// Utility: force flush DB to disk
ipcMain.handle('flush-db', async () => {
  if (db) {
    saveDbToDisk();
    return true;
  }
  return false;
});

// Export data
ipcMain.handle('export-data', async () => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Pomodoro Database',
      defaultPath: 'pomodoro.db',
      filters: [
        { name: 'SQLite DB', extensions: ['db'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      if (db) {
        saveDbToDisk();
        fs.copyFileSync(dbPath, result.filePath);
        return { success: true, path: result.filePath };
      }
      // fallback JSON
      const jsonPath = result.filePath.endsWith('.db') ? result.filePath + '.json' : result.filePath;
      fs.writeFileSync(jsonPath, fs.existsSync(dataPath) ? fs.readFileSync(dataPath, 'utf8') : JSON.stringify({ tasks: [], history: [], settings: {} }, null, 2));
      return { success: true, path: jsonPath };
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
      title: 'Import Pomodoro Database or JSON',
      filters: [
        { name: 'SQLite DB', extensions: ['db'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const file = result.filePaths[0];
      if (file.toLowerCase().endsWith('.db')) {
        // Replace the db file on disk and reload into sql.js
        fs.copyFileSync(file, dbPath);
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(new Uint8Array(fileBuffer));
        return { success: true };
      } else {
        // JSON import fallback: load and save into DB
        const parsedData = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (db) {
          db.run('BEGIN');
          try {
            run('DELETE FROM tasks');
            run('DELETE FROM settings');
            run('DELETE FROM history');
            if (Array.isArray(parsedData.tasks)) {
              const insertTask = db.prepare('INSERT INTO tasks(id, text, completed, createdAt, pomodoros) VALUES(@id, @text, @completed, @createdAt, @pomodoros)');
              for (const t of parsedData.tasks) {
                insertTask.bind({
                  '@id': t.id,
                  '@text': t.text || '',
                  '@completed': t.completed ? 1 : 0,
                  '@createdAt': t.createdAt || new Date().toISOString(),
                  '@pomodoros': t.pomodoros || 0
                });
                insertTask.step();
                insertTask.reset();
              }
              insertTask.free();
            }
            if (parsedData.settings) {
              const insertSetting = db.prepare('INSERT INTO settings(key, value) VALUES(@key, @value)');
              for (const [k, v] of Object.entries(parsedData.settings)) {
                insertSetting.bind({ '@key': k, '@value': JSON.stringify(v) });
                insertSetting.step();
                insertSetting.reset();
              }
              insertSetting.free();
            }
            if (Array.isArray(parsedData.history)) {
              const insertHistory = db.prepare('INSERT INTO history(taskId, startedAt, endedAt, mode) VALUES(@taskId, @startedAt, @endedAt, @mode)');
              for (const h of parsedData.history) {
                insertHistory.bind({ '@taskId': h.taskId ?? null, '@startedAt': h.startedAt || null, '@endedAt': h.endedAt || null, '@mode': h.mode || null });
                insertHistory.step();
                insertHistory.reset();
              }
              insertHistory.free();
            }
            db.run('COMMIT');
            saveDbToDisk();
            return { success: true };
          } catch (e) {
            db.run('ROLLBACK');
            throw e;
          }
        } else {
          // fallback write JSON
          fs.writeFileSync(dataPath, JSON.stringify(parsedData, null, 2));
          return { success: true };
        }
      }
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

// Window control handlers
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('toggle-maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
