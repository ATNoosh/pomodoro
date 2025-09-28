import { PomodoroApp, Settings } from './types.js';

// Settings management functionality for Pomodoro App
export class SettingsManager {
  private app: PomodoroApp;
  private defaultSettings: Settings = {
    workTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    notificationsEnabled: true,
    autoStartBreaks: true
  };

  constructor(app: PomodoroApp) {
    this.app = app;
  }
  
  // Apply settings to the app
  applySettings(): void {
    const settings = this.app.data.settings || this.defaultSettings;
    this.app.timer.updateLongBreakInterval(settings.longBreakInterval);
    
    // Update settings form if modal is open
    this.updateSettingsForm();
  }
  
  // Update settings form with current values
  updateSettingsForm(): void {
    const settings = this.app.data.settings || this.defaultSettings;
    
    const workTimeInput = document.getElementById('workTime') as HTMLInputElement;
    const breakTimeInput = document.getElementById('breakTime') as HTMLInputElement;
    const longBreakTimeInput = document.getElementById('longBreakTime') as HTMLInputElement;
    const longBreakIntervalInput = document.getElementById('longBreakInterval') as HTMLInputElement;
    const notificationsInput = document.getElementById('notificationsEnabled') as HTMLInputElement;
    const autoStartBreaksInput = document.getElementById('autoStartBreaks') as HTMLInputElement;
    
    if (workTimeInput) workTimeInput.value = (settings.workTime || this.defaultSettings.workTime).toString();
    if (breakTimeInput) breakTimeInput.value = (settings.breakTime || this.defaultSettings.breakTime).toString();
    if (longBreakTimeInput) longBreakTimeInput.value = (settings.longBreakTime || this.defaultSettings.longBreakTime).toString();
    if (longBreakIntervalInput) longBreakIntervalInput.value = (settings.longBreakInterval || this.defaultSettings.longBreakInterval).toString();
    if (notificationsInput) notificationsInput.checked = settings.notificationsEnabled !== undefined ? settings.notificationsEnabled : this.defaultSettings.notificationsEnabled;
    if (autoStartBreaksInput) autoStartBreaksInput.checked = settings.autoStartBreaks !== undefined ? settings.autoStartBreaks : this.defaultSettings.autoStartBreaks;
  }
  
  // Save settings from form
  saveSettings(): boolean {
    const settings: Settings = {
      workTime: parseInt((document.getElementById('workTime') as HTMLInputElement).value),
      breakTime: parseInt((document.getElementById('breakTime') as HTMLInputElement).value),
      longBreakTime: parseInt((document.getElementById('longBreakTime') as HTMLInputElement).value),
      longBreakInterval: parseInt((document.getElementById('longBreakInterval') as HTMLInputElement).value),
      notificationsEnabled: (document.getElementById('notificationsEnabled') as HTMLInputElement).checked,
      autoStartBreaks: (document.getElementById('autoStartBreaks') as HTMLInputElement).checked
    };
    
    // Validate settings
    if (!this.validateSettings(settings)) {
      this.app.notifications.show('Invalid Settings', 'Please check your settings values');
      return false;
    }
    
    this.app.data.settings = settings;
    this.applySettings();
    this.app.saveData();
    
    // If timer is not running, update the display
    if (!this.app.timer.isRunning) {
      this.app.timer.setup();
      this.app.timer.updateDisplay();
    }
    
    return true;
  }
  
  // Validate settings values
  private validateSettings(settings: Settings): boolean {
    return settings.workTime >= 1 && settings.workTime <= 60 &&
           settings.breakTime >= 1 && settings.breakTime <= 30 &&
           settings.longBreakTime >= 1 && settings.longBreakTime <= 60 &&
           settings.longBreakInterval >= 2 && settings.longBreakInterval <= 10;
  }
  
  // Reset settings to default
  resetToDefault(): void {
    this.app.data.settings = { ...this.defaultSettings };
    this.applySettings();
    this.app.saveData();
    this.updateSettingsForm();
  }
  
  // Get current settings
  getSettings(): Settings {
    return this.app.data.settings;
  }
  
  // Update a specific setting
  updateSetting(key: keyof Settings, value: any): void {
    if (this.app.data.settings.hasOwnProperty(key)) {
      (this.app.data.settings as any)[key] = value;
      this.applySettings();
      this.app.saveData();
    }
  }
  
  // Get setting value
  getSetting(key: keyof Settings): any {
    return this.app.data.settings[key];
  }
  
  // Check if notifications are enabled
  isNotificationsEnabled(): boolean {
    return this.app.data.settings.notificationsEnabled;
  }
  
  // Check if auto-start breaks is enabled
  isAutoStartBreaksEnabled(): boolean {
    return this.app.data.settings.autoStartBreaks;
  }
  
  // Get work time in seconds
  getWorkTimeSeconds(): number {
    return this.app.data.settings.workTime * 60;
  }
  
  // Get break time in seconds
  getBreakTimeSeconds(): number {
    return this.app.data.settings.breakTime * 60;
  }
  
  // Get long break time in seconds
  getLongBreakTimeSeconds(): number {
    return this.app.data.settings.longBreakTime * 60;
  }
  
  // Get long break interval
  getLongBreakInterval(): number {
    return this.app.data.settings.longBreakInterval;
  }
  
  // Export settings for backup
  exportSettings(): any {
    return {
      settings: this.app.data.settings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }
  
  // Import settings from backup
  importSettings(settingsData: any): boolean {
    if (settingsData && settingsData.settings) {
      this.app.data.settings = { ...this.defaultSettings, ...settingsData.settings };
      this.applySettings();
      this.app.saveData();
      this.updateSettingsForm();
      return true;
    }
    return false;
  }
}
