// Keyboard shortcuts functionality for Pomodoro App
class KeyboardManager {
    constructor(app) {
        this.app = app;
        this.setupKeyboardShortcuts();
    }
    
    // Setup all keyboard event listeners
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }
    
    // Handle keyboard key press
    handleKeyPress(e) {
        // Prevent shortcuts when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        console.log('Key pressed:', e.key);
        
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
    handleTimerShortcuts(e) {
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
    handleTaskShortcuts(e) {
        // N: Add New Task
        if (e.key === 'n' || e.key === 'N') {
            console.log('N key pressed, showing task input');
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
                console.log('Ctrl+X pressed, hiding task input');
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
            this.app.tasks.toggleTask(this.app.tasks.getSelectedTaskId());
        }
        
        // Delete: Delete Selected Task
        if (e.key === 'Delete' && this.app.tasks.getSelectedTaskId()) {
            e.preventDefault();
            if (Utils.confirm('Are you sure you want to delete this task?')) {
                this.app.tasks.deleteTask(this.app.tasks.getSelectedTaskId());
            }
        }
    }
    
    // Handle navigation and modal shortcuts
    handleNavigationShortcuts(e) {
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
    handleDataShortcuts(e) {
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
    getShortcutsHelp() {
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
    isShortcut(e) {
        const shortcuts = [
            ' ', 'Spacebar', 's', 'S', 'k', 'K', 'n', 'N', 'h', 'H', '?', '/',
            'ArrowUp', 'ArrowDown', 'Enter', 'Delete', 'Escape'
        ];
        
        const ctrlShortcuts = ['x', ',', 'e', 'i'];
        
        return shortcuts.includes(e.key) || 
               (e.ctrlKey && ctrlShortcuts.includes(e.key.toLowerCase()));
    }
    
    // Disable shortcuts temporarily (useful for modal inputs)
    disableShortcuts() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    
    // Re-enable shortcuts
    enableShortcuts() {
        document.addEventListener('keydown', this.handleKeyPress);
    }
}
