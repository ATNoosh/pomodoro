import { AppData, Settings } from './types.js';
import { Utils } from './utils.js';
import { Timer } from './timer.js';
import { TaskManager } from './tasks.js';
import { HistoryManager } from './history.js';
import { SettingsManager } from './settings.js';
import { ModalManager } from './modals.js';
import { KeyboardManager } from './keyboard.js';
import { NotificationManager } from './notifications.js';
import { StatsManager } from './stats.js';
import { DataManager } from './data-manager.js';

// Main Pomodoro App class - coordinates all modules
export class PomodoroApp {
  // Data structure
  public data: AppData = {
    tasks: [],
    history: [],
    settings: {
      workTime: 25,
      breakTime: 5,
      longBreakTime: 15,
      longBreakInterval: 4,
      notificationsEnabled: true,
      autoStartBreaks: true
    }
  };
  
  // All modules
  public timer: Timer;
  public tasks: TaskManager;
  public history: HistoryManager;
  public settings: SettingsManager;
  public modals: ModalManager;
  public keyboard: KeyboardManager;
  public notifications: NotificationManager;
  public stats: StatsManager;
  public dataManager: DataManager;

  constructor() {
    // Initialize all modules
    this.timer = new Timer(this);
    this.tasks = new TaskManager(this);
    this.history = new HistoryManager(this);
    this.settings = new SettingsManager(this);
    this.modals = new ModalManager(this);
    this.keyboard = new KeyboardManager(this);
    this.notifications = new NotificationManager(this);
    this.stats = new StatsManager(this);
    this.dataManager = new DataManager(this);
  }
  
  // Initialize the application
  async init(): Promise<void> {
    console.log('App initializing...');
    await this.dataManager.loadData();
    console.log('Data loaded, setting up UI...');
    
    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupEventListeners();
        this.timer.setup();
        this.updateUI();
        this.stats.update();
        this.notifications.requestPermission();
        
        // Ensure tasks are rendered after everything is loaded
        setTimeout(() => {
          console.log('Final renderTasks call...');
          this.tasks.render();
        }, 200);
      });
    } else {
      this.setupEventListeners();
      this.timer.setup();
      this.updateUI();
      this.stats.update();
      this.notifications.requestPermission();
      
      // Ensure tasks are rendered after everything is loaded
      setTimeout(() => {
        console.log('Final renderTasks call...');
        this.tasks.render();
      }, 200);
    }
  }
  
  // Setup all event listeners
  private setupEventListeners(): void {
    console.log('Setting up event listeners...');
    
    // Timer controls
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const skipBtn = document.getElementById('skipBtn');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (this.timer.isPaused) {
          this.timer.resume();
        } else {
          this.timer.start();
        }
      });
    }
    
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.timer.pause();
      });
    }
    
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.timer.stop();
      });
    }
    
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.timer.skip();
      });
    }
    
    // Task management
    const addTaskBtn = document.getElementById('addTaskBtn');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    const taskInput = document.getElementById('taskInput');
    const tasksList = document.getElementById('tasksList');
    const taskDate = document.getElementById('taskDate') as HTMLInputElement | null;
    
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        this.tasks.showTaskInput();
      });
    }
    
    if (saveTaskBtn) {
      saveTaskBtn.addEventListener('click', () => {
        const input = document.getElementById('taskInput') as HTMLInputElement;
        this.tasks.addTask(input.value);
        this.tasks.hideTaskInput();
      });
    }
    
    if (cancelTaskBtn) {
      cancelTaskBtn.addEventListener('click', () => {
        this.tasks.hideTaskInput();
      });
    }
    
    if (taskInput) {
      taskInput.addEventListener('keypress', (e) => {
        this.tasks.handleTaskInput(e as KeyboardEvent);
      });
    }
    
    if (tasksList) {
      tasksList.addEventListener('click', (e) => {
        this.tasks.handleTaskClick(e);
      });
    }
    
    if (taskDate) {
      // initialize to today
      const today = new Date().toISOString().slice(0, 10);
      taskDate.value = today;
      taskDate.addEventListener('change', () => {
        this.tasks.render();
        this.stats.update();
      });
    }
    
    // Export/Import
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const overlayBtn = document.getElementById('overlayBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const historyBtn = document.getElementById('historyBtn');
    const helpBtn = document.getElementById('helpBtn');
    
    console.log('Export button found:', !!exportBtn);
    console.log('Import button found:', !!importBtn);
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        console.log('Export button clicked!');
        this.dataManager.exportData();
      });
    }
    
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        console.log('Import button clicked!');
        this.dataManager.importData();
      });
    }
    
    if (overlayBtn) {
      overlayBtn.addEventListener('click', () => {
        console.log('Overlay button clicked!');
        const api = (window as any).electronAPI;
        if (api?.toggleOverlay) {
          api.toggleOverlay();
          try { api.timerTick?.(this.timer.getState()); } catch {}
        }
      });
    }

    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        console.log('Settings button clicked!');
        this.modals.showSettings();
      });
    }

    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        console.log('History button clicked!');
        this.modals.showHistory();
      });
    }

    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        console.log('Help button clicked!');
        this.modals.showHelp();
      });
    }
    
    // Window controls
    const minimizeBtn = document.getElementById('minimizeBtn');
    const maximizeBtn = document.getElementById('maximizeBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        this.minimizeWindow();
      });
    }
    
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', () => {
        this.toggleMaximizeWindow();
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeWindow();
      });
    }
    
    // Setup modal event listeners
    this.modals.setupModalEventListeners();
  }
  
  // Update the entire UI
  updateUI(): void {
    this.tasks.render();
    this.timer.updateDisplay();
    this.timer.updateButtons();
  }
  
  // Save data (delegated to data manager)
  async saveData(): Promise<void> {
    await this.dataManager.saveData();
  }
  
  // Get app state for debugging
  getState(): any {
    return {
      timer: this.timer.getState(),
      tasks: this.tasks.getAllTasks(),
      history: this.history.getAllHistory(),
      settings: this.settings.getSettings(),
      stats: this.stats.getAllTimeStats()
    };
  }
  
  // Reset app to initial state
  async reset(): Promise<void> {
    await this.dataManager.clearAllData();
    this.timer.stop();
    this.timer.setup();
    this.updateUI();
  }
  
  // Window control methods
  private minimizeWindow(): void {
    if (window.electronAPI && window.electronAPI.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  }
  
  private toggleMaximizeWindow(): void {
    if (window.electronAPI && window.electronAPI.toggleMaximizeWindow) {
      window.electronAPI.toggleMaximizeWindow();
    }
  }
  
  private closeWindow(): void {
    if (window.electronAPI && window.electronAPI.closeWindow) {
      window.electronAPI.closeWindow();
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pomodoroApp = new PomodoroApp();
  window.pomodoroApp.init();
});
