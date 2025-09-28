// Data management functionality for Pomodoro App
class DataManager {
    constructor(app) {
        this.app = app;
    }
    
    // Load data from storage
    async loadData() {
        try {
            const loadedData = await window.electronAPI.loadData();
            console.log('Loaded data:', loadedData);
            this.app.data = { ...this.app.data, ...loadedData };
            console.log('Final data after merge:', this.app.data);
            console.log('Tasks count:', this.app.data.tasks ? this.app.data.tasks.length : 0);
            this.app.settings.applySettings();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    // Save data to storage
    async saveData() {
        try {
            await window.electronAPI.saveData(this.app.data);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    // Export data
    async exportData() {
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
    async importData() {
        try {
            const result = await window.electronAPI.importData();
            if (result.success) {
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
    prepareExportData() {
        return {
            tasks: this.app.data.tasks,
            history: this.app.data.history,
            settings: this.app.data.settings,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }
    
    // Validate imported data
    validateImportData(data) {
        return data && 
               Array.isArray(data.tasks) && 
               Array.isArray(data.history) && 
               data.settings && 
               typeof data.settings === 'object';
    }
    
    // Clear all data
    async clearAllData() {
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
