import { PomodoroApp, ShortcutsHelp } from './types.js';

// Keyboard shortcuts functionality for Pomodoro App
export class KeyboardManager {
  private app: PomodoroApp;
  private static listenersBound = false;

  constructor(app: PomodoroApp) {
    this.app = app;
    this.setupKeyboardShortcuts();
  }
  
  // Setup all keyboard event listeners
  private setupKeyboardShortcuts(): void {
    if (KeyboardManager.listenersBound) {
      return;
    }
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });
    KeyboardManager.listenersBound = true;
  }
  
  // Handle keyboard key press
  private handleKeyPress(e: KeyboardEvent): void {
    // Prevent shortcuts when typing in inputs, EXCEPT for specific controls where we want to handle keys
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      const el = e.target as HTMLInputElement;
      // Allow handling when focus is on task date filter so ArrowUp/Down navigates tasks (not change date)
      // Also allow shortcuts when focus is on hidden/temporary task input container's input handling (we still manage Enter there separately)
      if (el.id !== 'taskDate') {
        return;
      }
      // If focused on taskDate, prevent its default arrow behavior so we navigate tasks instead of changing the date
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    }
    
    
    // Timer controls
    this.handleTimerShortcuts(e);
    
    // Task management
    this.handleTaskShortcuts(e);
    
    // Navigation and modals
    this.handleNavigationShortcuts(e);
    
    // Data management
    this.handleDataShortcuts(e);
  }
  
  // Handle timer-related keyboard shortcuts
  private handleTimerShortcuts(e: KeyboardEvent): void {
    // Spacebar: Start/Pause/Resume Timer
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (this.app.timer.isPaused) {
        this.app.timer.resume();
      } else if (this.app.timer.isRunning) {
        this.app.timer.pause();
      } else {
        this.app.timer.start();
      }
    }
    
    // S: Stop Timer
    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      this.app.timer.stop();
    }
    
    // K: Skip Current Session
    if (e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      this.app.timer.skip();
    }
  }
  
  // Handle task-related keyboard shortcuts
  private handleTaskShortcuts(e: KeyboardEvent): void {
    // N: Add New Task
    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      this.app.tasks.showTaskInput();
    }
    
    // Escape: Cancel Task Input
    if (e.key === 'Escape') {
      e.preventDefault();
      this.app.tasks.hideTaskInput();
      this.app.modals.closeAllModals();
    }
    
    // Ctrl+X: Cancel Task Input
    if (e.ctrlKey && e.key === 'x') {
      const container = document.getElementById('taskInputContainer');
      if (container && container.style.display === 'block') {
        e.preventDefault();
        this.app.tasks.hideTaskInput();
      }
    }
    
    // Arrow Keys: Navigate Tasks
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.app.tasks.navigateTasks(e.key === 'ArrowUp' ? -1 : 1);
    }
    
    // Enter: Toggle Selected Task
    if (e.key === 'Enter' && this.app.tasks.getSelectedTaskId()) {
      e.preventDefault();
      this.app.tasks.toggleTask(this.app.tasks.getSelectedTaskId()!);
    }
    
    // Delete: Delete Selected Task (ignore auto-repeat to prevent multiple deletions)
    if (e.key === 'Delete' && this.app.tasks.getSelectedTaskId()) {
      if ((e as any).repeat) return;
      e.preventDefault();
      if (confirm('Are you sure you want to delete this task?')) {
        this.app.tasks.deleteTask(this.app.tasks.getSelectedTaskId()!);
      }
    }
  }
  
  // Handle navigation and modal shortcuts
  private handleNavigationShortcuts(e: KeyboardEvent): void {
    // Ctrl+,: Open Settings
    if (e.ctrlKey && e.key === ',') {
      e.preventDefault();
      this.app.modals.showSettings();
    }
    
    // H: Show History
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      this.app.modals.showHistory();
    }
    
    // ? or /: Show Help
    if (e.key === '?' || e.key === '/') {
      e.preventDefault();
      this.app.modals.showHelp();
    }
  }
  
  // Handle data management shortcuts
  private handleDataShortcuts(e: KeyboardEvent): void {
    // Ctrl+E: Export Data
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      this.app.dataManager.exportData();
    }
    
    // Ctrl+I: Import Data
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      this.app.dataManager.importData();
    }
  }
  
  // Get keyboard shortcut help text
  getShortcutsHelp(): ShortcutsHelp {
    return {
      timer: [
        { key: 'Space', description: 'Start/Pause/Resume Timer' },
        { key: 'S', description: 'Stop Timer' },
        { key: 'K', description: 'Skip Current Session' }
      ],
      tasks: [
        { key: 'N', description: 'Add New Task' },
        { key: 'Ctrl+X', description: 'Cancel Task Input' },
        { key: '↑/↓', description: 'Navigate Tasks' },
        { key: 'Enter', description: 'Toggle Task (when selected)' },
        { key: 'Delete', description: 'Delete Task (when selected)' }
      ],
      navigation: [
        { key: 'Ctrl+,', description: 'Open Settings' },
        { key: 'H', description: 'Show History' },
        { key: '?', description: 'Show Help (this window)' },
        { key: 'Escape', description: 'Close Modals' }
      ],
      data: [
        { key: 'Ctrl+E', description: 'Export Data' },
        { key: 'Ctrl+I', description: 'Import Data' }
      ]
    };
  }
  
  // Check if a key combination is a shortcut
  isShortcut(e: KeyboardEvent): boolean {
    const shortcuts = [
      ' ', 'Spacebar', 's', 'S', 'k', 'K', 'n', 'N', 'h', 'H', '?', '/',
      'ArrowUp', 'ArrowDown', 'Enter', 'Delete', 'Escape'
    ];
    
    const ctrlShortcuts = ['x', ',', 'e', 'i'];
    
    return shortcuts.includes(e.key) || 
           (e.ctrlKey && ctrlShortcuts.includes(e.key.toLowerCase()));
  }
  
  // Disable shortcuts temporarily (useful for modal inputs)
  disableShortcuts(): void {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
  
  // Re-enable shortcuts
  enableShortcuts(): void {
    document.addEventListener('keydown', this.handleKeyPress);
  }
}
