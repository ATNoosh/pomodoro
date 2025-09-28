// Notification management functionality for Pomodoro App
class NotificationManager {
    constructor(app) {
        this.app = app;
        this.permissionGranted = false;
    }
    
    // Request notification permission
    async requestPermission() {
        try {
            await window.electronAPI.requestNotificationPermission();
            this.permissionGranted = true;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            this.permissionGranted = false;
        }
    }
    
    // Show notification if enabled
    async show(title, body, icon) {
        if (this.app.settings.isNotificationsEnabled()) {
            try {
                await window.electronAPI.showNotification({ title, body, icon });
            } catch (error) {
                console.error('Error showing notification:', error);
            }
        }
    }
    
    // Check if notifications are supported
    isSupported() {
        return 'Notification' in window || window.electronAPI;
    }
    
    // Get permission status
    getPermissionStatus() {
        return this.permissionGranted;
    }
}
