// Settings management functionality for Pomodoro App
class SettingsManager {
    constructor(app) {
        this.app = app;
        this.defaultSettings = {
            workTime: 25,
            breakTime: 5,
            longBreakTime: 15,
            longBreakInterval: 4,
            notificationsEnabled: true,
            autoStartBreaks: true
        };
    }
    
    // Apply settings to the app
    applySettings() {
        const settings = this.app.data.settings;
        this.app.timer.updateLongBreakInterval(settings.longBreakInterval);
        
        // Update settings form if modal is open
        this.updateSettingsForm();
    }
    
    // Update settings form with current values
    updateSettingsForm() {
        const settings = this.app.data.settings;
        
        const workTimeInput = document.getElementById('workTime');
        const breakTimeInput = document.getElementById('breakTime');
        const longBreakTimeInput = document.getElementById('longBreakTime');
        const longBreakIntervalInput = document.getElementById('longBreakInterval');
        const notificationsInput = document.getElementById('notificationsEnabled');
        const autoStartBreaksInput = document.getElementById('autoStartBreaks');
        
        if (workTimeInput) workTimeInput.value = settings.workTime;
        if (breakTimeInput) breakTimeInput.value = settings.breakTime;
        if (longBreakTimeInput) longBreakTimeInput.value = settings.longBreakTime;
        if (longBreakIntervalInput) longBreakIntervalInput.value = settings.longBreakInterval;
        if (notificationsInput) notificationsInput.checked = settings.notificationsEnabled;
        if (autoStartBreaksInput) autoStartBreaksInput.checked = settings.autoStartBreaks;
    }
    
    // Save settings from form
    saveSettings() {
        const settings = {
            workTime: parseInt(document.getElementById('workTime').value),
            breakTime: parseInt(document.getElementById('breakTime').value),
            longBreakTime: parseInt(document.getElementById('longBreakTime').value),
            longBreakInterval: parseInt(document.getElementById('longBreakInterval').value),
            notificationsEnabled: document.getElementById('notificationsEnabled').checked,
            autoStartBreaks: document.getElementById('autoStartBreaks').checked
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
    validateSettings(settings) {
        return settings.workTime >= 1 && settings.workTime <= 60 &&
               settings.breakTime >= 1 && settings.breakTime <= 30 &&
               settings.longBreakTime >= 1 && settings.longBreakTime <= 60 &&
               settings.longBreakInterval >= 2 && settings.longBreakInterval <= 10;
    }
    
    // Reset settings to default
    resetToDefault() {
        this.app.data.settings = { ...this.defaultSettings };
        this.applySettings();
        this.app.saveData();
        this.updateSettingsForm();
    }
    
    // Get current settings
    getSettings() {
        return this.app.data.settings;
    }
    
    // Update a specific setting
    updateSetting(key, value) {
        if (this.app.data.settings.hasOwnProperty(key)) {
            this.app.data.settings[key] = value;
            this.applySettings();
            this.app.saveData();
        }
    }
    
    // Get setting value
    getSetting(key) {
        return this.app.data.settings[key];
    }
    
    // Check if notifications are enabled
    isNotificationsEnabled() {
        return this.app.data.settings.notificationsEnabled;
    }
    
    // Check if auto-start breaks is enabled
    isAutoStartBreaksEnabled() {
        return this.app.data.settings.autoStartBreaks;
    }
    
    // Get work time in seconds
    getWorkTimeSeconds() {
        return this.app.data.settings.workTime * 60;
    }
    
    // Get break time in seconds
    getBreakTimeSeconds() {
        return this.app.data.settings.breakTime * 60;
    }
    
    // Get long break time in seconds
    getLongBreakTimeSeconds() {
        return this.app.data.settings.longBreakTime * 60;
    }
    
    // Get long break interval
    getLongBreakInterval() {
        return this.app.data.settings.longBreakInterval;
    }
    
    // Export settings for backup
    exportSettings() {
        return {
            settings: this.app.data.settings,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }
    
    // Import settings from backup
    importSettings(settingsData) {
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
