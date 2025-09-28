// Modal management functionality for Pomodoro App
class ModalManager {
    constructor(app) {
        this.app = app;
        this.activeModal = null;
    }
    
    // Show settings modal
    showSettings() {
        this.app.settings.updateSettingsForm();
        this.showModal('settingsModal');
    }
    
    // Hide settings modal
    hideSettings() {
        this.hideModal('settingsModal');
    }
    
    // Show history modal
    showHistory() {
        this.app.history.render();
        this.showModal('historyModal');
    }
    
    // Hide history modal
    hideHistory() {
        this.hideModal('historyModal');
    }
    
    // Show help modal
    showHelp() {
        this.showModal('helpModal');
    }
    
    // Hide help modal
    hideHelp() {
        this.hideModal('helpModal');
    }
    
    // Generic modal show method
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            this.activeModal = modalId;
            this.setupModalEvents(modal);
        }
    }
    
    // Generic modal hide method
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            if (this.activeModal === modalId) {
                this.activeModal = null;
            }
        }
    }
    
    // Setup modal-specific events
    setupModalEvents(modal) {
        // Close button events
        const closeBtn = modal.querySelector('.modal-close, .close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.hideModal(modal.id);
            };
        }
        
        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.hideModal(modal.id);
            }
        };
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && this.activeModal === modal.id) {
                this.hideModal(modal.id);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    // Handle settings modal save
    handleSettingsSave() {
        if (this.app.settings.saveSettings()) {
            this.hideSettings();
            this.app.notifications.show('Settings Saved', 'Your settings have been updated');
        }
    }
    
    // Handle history filter change
    handleHistoryFilterChange(filter) {
        this.app.history.render(filter);
    }
    
    // Close all modals
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        this.activeModal = null;
    }
    
    // Check if any modal is open
    isAnyModalOpen() {
        return this.activeModal !== null;
    }
    
    // Get active modal ID
    getActiveModal() {
        return this.activeModal;
    }
    
    // Setup all modal event listeners
    setupModalEventListeners() {
        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        }
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.handleSettingsSave());
        }
        
        // History modal
        const historyBtn = document.getElementById('historyBtn');
        const closeHistoryBtn = document.getElementById('closeHistoryBtn');
        const historyFilter = document.getElementById('historyFilter');
        
        if (historyBtn) {
            historyBtn.addEventListener('click', () => this.showHistory());
        }
        if (closeHistoryBtn) {
            closeHistoryBtn.addEventListener('click', () => this.hideHistory());
        }
        if (historyFilter) {
            historyFilter.addEventListener('change', (e) => this.handleHistoryFilterChange(e.target.value));
        }
        
        // Help modal
        const helpBtn = document.getElementById('helpBtn');
        const closeHelpBtn = document.getElementById('closeHelpBtn');
        
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => this.hideHelp());
        }
        
        // Global modal close on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }
}
