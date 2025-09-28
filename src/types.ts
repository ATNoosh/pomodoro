// Type definitions for Pomodoro App

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  pomodoros: number;
}

export interface HistoryItem {
  id: number;
  type: 'work' | 'break' | 'long-break';
  duration: number;
  completedAt: string;
  pomodoroCount: number;
}

export interface Settings {
  workTime: number;
  breakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
  notificationsEnabled: boolean;
  autoStartBreaks: boolean;
}

export interface AppData {
  tasks: Task[];
  history: HistoryItem[];
  settings: Settings;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  totalTime: number;
  currentMode: 'work' | 'break' | 'long-break';
  pomodoroCount: number;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
}

export interface ExportData {
  tasks: Task[];
  history: HistoryItem[];
  settings: Settings;
  exportedAt: string;
  version: string;
}

export interface HistoryStats {
  totalSessions: number;
  workSessions: number;
  breakSessions: number;
  totalFocusTime: number;
  averageSessionLength: number;
}

export interface TodayStats {
  pomodoros: number;
  completedTasks: number;
}

export interface AllTimeStats {
  totalPomodoros: number;
  totalTasks: number;
  totalFocusTime: number;
}

export interface ShortcutInfo {
  key: string;
  description: string;
}

export interface ShortcutsHelp {
  timer: ShortcutInfo[];
  tasks: ShortcutInfo[];
  navigation: ShortcutInfo[];
  data: ShortcutInfo[];
}

// Electron API types
export interface ElectronAPI {
  // Data management
  loadData: () => Promise<AppData>;
  saveData: (data: AppData) => Promise<boolean>;
  exportData: () => Promise<{ success: boolean; path?: string; error?: string }>;
  importData: () => Promise<{ success: boolean; data?: AppData; error?: string }>;
  
  // Notifications
  requestNotificationPermission: () => Promise<boolean>;
  showNotification: (options: NotificationOptions) => Promise<boolean>;
  
  // Window controls
  minimizeWindow: () => Promise<void>;
  toggleMaximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  
  // Platform info
  platform: string;
  appVersion: string;
}

// Forward declaration for PomodoroApp
export interface PomodoroApp {
  data: AppData;
  timer: any;
  tasks: any;
  history: any;
  settings: any;
  modals: any;
  keyboard: any;
  notifications: any;
  stats: any;
  dataManager: any;
  saveData(): Promise<void>;
  updateUI(): void;
}

// Extend Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    pomodoroApp: any; // Will be set to PomodoroApp instance
  }
}
