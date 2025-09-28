import { PomodoroApp, NotificationOptions } from './types.js';

// Notification management functionality for Pomodoro App
export class NotificationManager {
  private app: PomodoroApp;
  private permissionGranted: boolean = false;

  constructor(app: PomodoroApp) {
    this.app = app;
  }
  
  // Request notification permission
  async requestPermission(): Promise<void> {
    try {
      await window.electronAPI.requestNotificationPermission();
      this.permissionGranted = true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.permissionGranted = false;
    }
  }
  
  // Show notification if enabled
  async show(title: string, body: string, icon?: string): Promise<void> {
    if (this.app.settings.isNotificationsEnabled()) {
      try {
        await window.electronAPI.showNotification({ title, body, icon });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }
  
  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window || !!(window as any).electronAPI;
  }
  
  // Get permission status
  getPermissionStatus(): boolean {
    return this.permissionGranted;
  }
}
