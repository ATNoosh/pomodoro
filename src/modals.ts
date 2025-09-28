import { PomodoroApp } from './types.js';

// Modal management functionality for Pomodoro App
export class ModalManager {
  private app: PomodoroApp;
  private activeModal: string | null = null;

  constructor(app: PomodoroApp) {
    this.app = app;
  }
  
  // Show settings modal
  showSettings(): void {
    this.app.settings.updateSettingsForm();
    this.showModal('settingsModal');
  }
  
  // Hide settings modal
  hideSettings(): void {
    this.hideModal('settingsModal');
  }
  
  // Show history modal
  showHistory(): void {
    this.app.history.render();
    this.showModal('historyModal');
  }
  
  // Hide history modal
  hideHistory(): void {
    this.hideModal('historyModal');
  }
  
  // Show help modal
  showHelp(): void {
    this.showModal('helpModal');
  }
  
  // Hide help modal
  hideHelp(): void {
    this.hideModal('helpModal');
  }
  
  // Generic modal show method
  private showModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      this.activeModal = modalId;
      this.setupModalEvents(modal);
    }
  }
  
  // Generic modal hide method
  private hideModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      if (this.activeModal === modalId) {
        this.activeModal = null;
      }
    }
  }
  
  // Setup modal-specific events
  private setupModalEvents(modal: HTMLElement): void {
    // Close button events
    const closeBtn = modal.querySelector('.modal-close, .close-btn') as HTMLElement;
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
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.activeModal === modal.id) {
        this.hideModal(modal.id);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }
  
  // Handle settings modal save
  handleSettingsSave(): void {
    if (this.app.settings.saveSettings()) {
      this.hideSettings();
      this.app.notifications.show('Settings Saved', 'Your settings have been updated');
    }
  }
  
  // Handle history filter change
  handleHistoryFilterChange(filter: string): void {
    this.app.history.render(filter);
  }
  
  // Close all modals
  closeAllModals(): void {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.classList.remove('show');
    });
    this.activeModal = null;
  }
  
  // Check if any modal is open
  isAnyModalOpen(): boolean {
    return this.activeModal !== null;
  }
  
  // Get active modal ID
  getActiveModal(): string | null {
    return this.activeModal;
  }
  
  // Setup all modal event listeners
  setupModalEventListeners(): void {
    console.log('Setting up modal event listeners...');
    
    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    console.log('Settings button found:', !!settingsBtn);
    
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        console.log('Settings button clicked!');
        this.showSettings();
      });
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
    const historyFilter = document.getElementById('historyFilter') as HTMLSelectElement;
    
    if (historyBtn) {
      historyBtn.addEventListener('click', () => this.showHistory());
    }
    if (closeHistoryBtn) {
      closeHistoryBtn.addEventListener('click', () => this.hideHistory());
    }
    if (historyFilter) {
      historyFilter.addEventListener('change', (e) => this.handleHistoryFilterChange((e.target as HTMLSelectElement).value));
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
      const target = e.target as HTMLElement;
      if (target.classList.contains('modal')) {
        this.closeAllModals();
      }
    });
  }
}
