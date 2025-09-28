// Main Pomodoro App class - coordinates all modules
class PomodoroApp {
    constructor() {
        // Initialize data structure
        this.data = {
            tasks: [],
            history: [],
            settings: {
                workTime: 25,
                breakTime: 5,
                longBreakTime: 15,
                longBreakInterval: 4,
                notificationsEnabled: true,
                autoStartBreaks: true
            }
        };
        
        // Initialize all modules
        this.timer = new Timer(this);
        this.tasks = new TaskManager(this);
        this.history = new HistoryManager(this);
        this.settings = new SettingsManager(this);
        this.modals = new ModalManager(this);
        this.keyboard = new KeyboardManager(this);
        this.notifications = new NotificationManager(this);
        this.stats = new StatsManager(this);
        this.dataManager = new DataManager(this);
        
        // Initialize the app
        this.init();
    }
    
    // Initialize the application
    async init() {
        console.log('App initializing...');
        await this.dataManager.loadData();
        console.log('Data loaded, setting up UI...');
        this.setupEventListeners();
        this.timer.setup();
        
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateUI();
                this.stats.update();
            });
        } else {
            this.updateUI();
            this.stats.update();
        }
        
        this.notifications.requestPermission();
        
        // Ensure tasks are rendered after everything is loaded
        setTimeout(() => {
            console.log('Final renderTasks call...');
            this.tasks.render();
        }, 200);
    }
    
    // Setup all event listeners
    setupEventListeners() {
        // Timer controls
        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.timer.isPaused) {
                this.timer.resume();
            } else {
                this.timer.start();
            }
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.timer.pause();
        });
        
        document.getElementById('stopBtn').addEventListener('click', () => {
            this.timer.stop();
        });
        
        document.getElementById('skipBtn').addEventListener('click', () => {
            this.timer.skip();
        });
        
        // Task management
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.tasks.showTaskInput();
        });
        
        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            const input = document.getElementById('taskInput');
            this.tasks.addTask(input.value);
            this.tasks.hideTaskInput();
        });
        
        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            this.tasks.hideTaskInput();
        });
        
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            this.tasks.handleTaskInput(e);
        });
        
        // Task list events (delegated)
        document.getElementById('tasksList').addEventListener('click', (e) => {
            this.tasks.handleTaskClick(e);
        });
        
        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.dataManager.exportData();
        });
        
        document.getElementById('importBtn').addEventListener('click', () => {
            this.dataManager.importData();
        });
        
        // Setup modal event listeners
        this.modals.setupModalEventListeners();
    }
    
    // Update the entire UI
    updateUI() {
        this.tasks.render();
        this.timer.updateDisplay();
        this.timer.updateButtons();
    }
    
    // Save data (delegated to data manager)
    async saveData() {
        await this.dataManager.saveData();
    }
    
    // Get app state for debugging
    getState() {
        return {
            timer: this.timer.getState(),
            tasks: this.tasks.getAllTasks(),
            history: this.history.getAllHistory(),
            settings: this.settings.getSettings(),
            stats: this.stats.getAllTimeStats()
        };
    }
    
    // Reset app to initial state
    async reset() {
        await this.dataManager.clearAllData();
        this.timer.stop();
        this.timer.setup();
        this.updateUI();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroApp = new PomodoroApp();
});
