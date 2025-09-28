import { PomodoroApp, AppData, ExportData } from './types.js';

// Data management functionality for Pomodoro App
export class DataManager {
  private app: PomodoroApp;

  constructor(app: PomodoroApp) {
    this.app = app;
  }
  
  // Load data from storage
  async loadData(): Promise<void> {
    try {
      const loadedData = await window.electronAPI.loadData();
      console.log('Loaded data:', loadedData);
      
      // Merge data with proper defaults
      this.app.data = {
        tasks: loadedData.tasks || [],
        history: loadedData.history || [],
        settings: {
          workTime: loadedData.settings?.workTime || 25,
          breakTime: loadedData.settings?.breakTime || 5,
          longBreakTime: loadedData.settings?.longBreakTime || 15,
          longBreakInterval: loadedData.settings?.longBreakInterval || 4,
          notificationsEnabled: loadedData.settings?.notificationsEnabled !== undefined ? loadedData.settings.notificationsEnabled : true,
          autoStartBreaks: loadedData.settings?.autoStartBreaks !== undefined ? loadedData.settings.autoStartBreaks : true
        }
      };
      
      console.log('Final data after merge:', this.app.data);
      console.log('Tasks count:', this.app.data.tasks ? this.app.data.tasks.length : 0);
      this.app.settings.applySettings();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
  
  // Save data to storage
  async saveData(): Promise<void> {
    try {
      await window.electronAPI.saveData(this.app.data);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
  
  // Export data
  async exportData(): Promise<void> {
    try {
      const result = await window.electronAPI.exportData();
      if (result.success) {
        this.app.notifications.show('Export Successful', `Data exported to ${result.path}`);
      } else {
        this.app.notifications.show('Export Failed', 'Could not export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      this.app.notifications.show('Export Failed', 'An error occurred during export');
    }
  }
  
  // Import data
  async importData(): Promise<void> {
    try {
      const result = await window.electronAPI.importData();
      if (result.success && result.data) {
        this.app.data = result.data;
        this.app.settings.applySettings();
        this.app.updateUI();
        this.app.stats.update();
        this.app.notifications.show('Import Successful', 'Data imported successfully');
      } else {
        this.app.notifications.show('Import Failed', 'Could not import data');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      this.app.notifications.show('Import Failed', 'An error occurred during import');
    }
  }
  
  // Prepare data for export
  prepareExportData(): ExportData {
    return {
      tasks: this.app.data.tasks,
      history: this.app.data.history,
      settings: this.app.data.settings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }
  
  // Validate imported data
  validateImportData(data: any): data is AppData {
    return data && 
           Array.isArray(data.tasks) && 
           Array.isArray(data.history) && 
           data.settings && 
           typeof data.settings === 'object';
  }
  
  // Clear all data
  async clearAllData(): Promise<void> {
    this.app.data = {
      tasks: [],
      history: [],
      settings: this.app.settings.defaultSettings
    };
    await this.saveData();
    this.app.updateUI();
    this.app.stats.update();
  }
}
