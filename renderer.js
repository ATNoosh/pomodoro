// Pomodoro Todo App - Main Application Logic
class PomodoroApp {
    constructor() {
        this.timer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.totalTime = 0;
        this.currentMode = 'work'; // work, break, long-break
        this.pomodoroCount = 0;
        this.longBreakInterval = 4;
        
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
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.updateUI();
        this.updateStats();
        this.requestNotificationPermission();
    }
    
    // Data Management
    async loadData() {
        try {
            const loadedData = await window.electronAPI.loadData();
            this.data = { ...this.data, ...loadedData };
            this.applySettings();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    async saveData() {
        try {
            await window.electronAPI.saveData(this.data);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    applySettings() {
        const settings = this.data.settings;
        this.longBreakInterval = settings.longBreakInterval;
        
        // Update settings form if modal is open
        if (document.getElementById('workTime')) {
            document.getElementById('workTime').value = settings.workTime;
            document.getElementById('breakTime').value = settings.breakTime;
            document.getElementById('longBreakTime').value = settings.longBreakTime;
            document.getElementById('longBreakInterval').value = settings.longBreakInterval;
            document.getElementById('notificationsEnabled').checked = settings.notificationsEnabled;
            document.getElementById('autoStartBreaks').checked = settings.autoStartBreaks;
        }
    }
    
    // Timer Functions
    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            
            if (this.currentTime === 0) {
                this.setupTimer();
            }
            
            this.timer = setInterval(() => {
                this.tick();
            }, 1000);
            
            this.updateTimerButtons();
        }
    }
    
    pauseTimer() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            clearInterval(this.timer);
            this.updateTimerButtons();
        }
    }
    
    resumeTimer() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.timer = setInterval(() => {
                this.tick();
            }, 1000);
            this.updateTimerButtons();
        }
    }
    
    stopTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timer);
        this.currentTime = 0;
        this.updateTimerDisplay();
        this.updateTimerButtons();
    }
    
    skipTimer() {
        this.stopTimer();
        this.nextMode();
    }
    
    setupTimer() {
        const settings = this.data.settings;
        
        switch (this.currentMode) {
            case 'work':
                this.totalTime = settings.workTime * 60;
                break;
            case 'break':
                this.totalTime = settings.breakTime * 60;
                break;
            case 'long-break':
                this.totalTime = settings.longBreakTime * 60;
                break;
        }
        
        this.currentTime = this.totalTime;
        this.updateTimerDisplay();
    }
    
    tick() {
        this.currentTime--;
        this.updateTimerDisplay();
        
        if (this.currentTime <= 0) {
            this.timerComplete();
        }
    }
    
    timerComplete() {
        this.stopTimer();
        this.addToHistory();
        
        if (this.currentMode === 'work') {
            this.pomodoroCount++;
            this.showNotification('Pomodoro Complete!', 'Time for a break!');
        } else {
            this.showNotification('Break Complete!', 'Ready to work?');
        }
        
        this.nextMode();
        
        if (this.data.settings.autoStartBreaks && this.currentMode !== 'work') {
            setTimeout(() => {
                this.startTimer();
            }, 2000);
        }
    }
    
    nextMode() {
        if (this.currentMode === 'work') {
            if (this.pomodoroCount % this.longBreakInterval === 0) {
                this.currentMode = 'long-break';
            } else {
                this.currentMode = 'break';
            }
        } else {
            this.currentMode = 'work';
        }
        
        this.setupTimer();
        this.updateTimerDisplay();
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = display;
        
        // Update mode text
        const modeText = {
            'work': 'Work Time',
            'break': 'Short Break',
            'long-break': 'Long Break'
        };
        document.getElementById('timerMode').textContent = modeText[this.currentMode];
        
        // Update progress circle
        const progress = ((this.totalTime - this.currentTime) / this.totalTime) * 283;
        const progressCircle = document.getElementById('timerProgress');
        progressCircle.style.strokeDashoffset = 283 - progress;
        
        // Update progress color based on mode
        progressCircle.className = `timer-progress ${this.currentMode}`;
    }
    
    updateTimerButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const skipBtn = document.getElementById('skipBtn');
        
        if (!this.isRunning) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            skipBtn.disabled = true;
        } else if (this.isPaused) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            pauseBtn.disabled = true;
            stopBtn.disabled = false;
            skipBtn.disabled = false;
        } else {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            skipBtn.disabled = false;
        }
    }
    
    // Task Management
    addTask(text) {
        if (text.trim()) {
            const task = {
                id: Date.now(),
                text: text.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
                pomodoros: 0
            };
            
            this.data.tasks.push(task);
            this.saveData();
            this.renderTasks();
            this.updateStats();
        }
    }
    
    toggleTask(id) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveData();
            this.renderTasks();
            this.updateStats();
        }
    }
    
    editTask(id, newText) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
            this.saveData();
            this.renderTasks();
        }
    }
    
    deleteTask(id) {
        this.data.tasks = this.data.tasks.filter(t => t.id !== id);
        this.saveData();
        this.renderTasks();
        this.updateStats();
    }
    
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
        
        this.data.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    }
    
    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
            <div class="task-text">${this.escapeHtml(task.text)}</div>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${task.id}" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return div;
    }
    
    // History Management
    addToHistory() {
        const historyItem = {
            id: Date.now(),
            type: this.currentMode,
            duration: this.totalTime,
            completedAt: new Date().toISOString(),
            pomodoroCount: this.pomodoroCount
        };
        
        this.data.history.push(historyItem);
        this.saveData();
        this.updateStats();
    }
    
    renderHistory(filter = 'all') {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        let filteredHistory = this.data.history;
        const now = new Date();
        
        switch (filter) {
            case 'today':
                filteredHistory = this.data.history.filter(item => {
                    const itemDate = new Date(item.completedAt);
                    return itemDate.toDateString() === now.toDateString();
                });
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredHistory = this.data.history.filter(item => 
                    new Date(item.completedAt) >= weekAgo
                );
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredHistory = this.data.history.filter(item => 
                    new Date(item.completedAt) >= monthAgo
                );
                break;
        }
        
        historyList.innerHTML = '';
        
        filteredHistory.reverse().forEach(item => {
            const historyElement = this.createHistoryElement(item);
            historyList.appendChild(historyElement);
        });
    }
    
    createHistoryElement(item) {
        const div = document.createElement('div');
        div.className = `history-item ${item.type}`;
        
        const typeText = {
            'work': 'Work Session',
            'break': 'Short Break',
            'long-break': 'Long Break'
        };
        
        const duration = Math.floor(item.duration / 60);
        const completedAt = new Date(item.completedAt);
        const timeString = completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        div.innerHTML = `
            <div class="history-item-header">
                <span class="history-item-type">${typeText[item.type]}</span>
                <span class="history-item-time">${timeString}</span>
            </div>
            <div class="history-item-description">
                Duration: ${duration} minutes
                ${item.type === 'work' ? ` • Pomodoro #${item.pomodoroCount}` : ''}
            </div>
        `;
        
        return div;
    }
    
    // Statistics
    updateStats() {
        const today = new Date().toDateString();
        const todayPomodoros = this.data.history.filter(item => 
            item.type === 'work' && new Date(item.completedAt).toDateString() === today
        ).length;
        
        const completedTasks = this.data.tasks.filter(task => task.completed).length;
        
        document.getElementById('todayPomodoros').textContent = todayPomodoros;
        document.getElementById('completedTasks').textContent = completedTasks;
        
        // Update history stats if modal is open
        if (document.getElementById('totalPomodoros')) {
            const totalPomodoros = this.data.history.filter(item => item.type === 'work').length;
            const totalTasks = this.data.tasks.filter(task => task.completed).length;
            const totalTime = this.data.history
                .filter(item => item.type === 'work')
                .reduce((sum, item) => sum + item.duration, 0);
            const totalHours = Math.floor(totalTime / 3600);
            
            document.getElementById('totalPomodoros').textContent = totalPomodoros;
            document.getElementById('totalTasks').textContent = totalTasks;
            document.getElementById('totalTime').textContent = `${totalHours}h`;
        }
    }
    
    // UI Updates
    updateUI() {
        this.renderTasks();
        this.updateTimerDisplay();
        this.updateTimerButtons();
    }
    
    // Notifications
    async requestNotificationPermission() {
        try {
            await window.electronAPI.requestNotificationPermission();
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }
    
    async showNotification(title, body) {
        if (this.data.settings.notificationsEnabled) {
            try {
                await window.electronAPI.showNotification({ title, body });
            } catch (error) {
                console.error('Error showing notification:', error);
            }
        }
    }
    
    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Event Listeners
    setupEventListeners() {
        // Timer controls
        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.isPaused) {
                this.resumeTimer();
            } else {
                this.startTimer();
            }
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseTimer();
        });
        
        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopTimer();
        });
        
        document.getElementById('skipBtn').addEventListener('click', () => {
            this.skipTimer();
        });
        
        // Task management
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showTaskInput();
        });
        
        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            const input = document.getElementById('taskInput');
            this.addTask(input.value);
            this.hideTaskInput();
        });
        
        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            this.hideTaskInput();
        });
        
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = document.getElementById('taskInput');
                this.addTask(input.value);
                this.hideTaskInput();
            }
        });
        
        // Task list events (delegated)
        document.getElementById('tasksList').addEventListener('click', (e) => {
            const checkbox = e.target.closest('.task-checkbox');
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');
            
            if (checkbox) {
                const id = parseInt(checkbox.dataset.id);
                this.toggleTask(id);
            } else if (editBtn) {
                const id = parseInt(editBtn.dataset.id);
                this.editTaskPrompt(id);
            } else if (deleteBtn) {
                const id = parseInt(deleteBtn.dataset.id);
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(id);
                }
            }
        });
        
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsModal();
        });
        
        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.hideSettingsModal();
        });
        
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // History modal
        document.getElementById('historyBtn').addEventListener('click', () => {
            this.showHistoryModal();
        });
        
        document.getElementById('closeHistoryBtn').addEventListener('click', () => {
            this.hideHistoryModal();
        });
        
        document.getElementById('historyFilter').addEventListener('change', (e) => {
            this.renderHistory(e.target.value);
        });
        
        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('importBtn').addEventListener('click', () => {
            this.importData();
        });
        
        // Modal close on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideSettingsModal();
                this.hideHistoryModal();
            }
        });
    }
    
    // Modal Functions
    showTaskInput() {
        const container = document.getElementById('taskInputContainer');
        const input = document.getElementById('taskInput');
        container.style.display = 'block';
        input.focus();
    }
    
    hideTaskInput() {
        const container = document.getElementById('taskInputContainer');
        const input = document.getElementById('taskInput');
        container.style.display = 'none';
        input.value = '';
    }
    
    showSettingsModal() {
        this.applySettings();
        document.getElementById('settingsModal').classList.add('show');
    }
    
    hideSettingsModal() {
        document.getElementById('settingsModal').classList.remove('show');
    }
    
    showHistoryModal() {
        this.renderHistory();
        document.getElementById('historyModal').classList.add('show');
    }
    
    hideHistoryModal() {
        document.getElementById('historyModal').classList.remove('show');
    }
    
    saveSettings() {
        const settings = {
            workTime: parseInt(document.getElementById('workTime').value),
            breakTime: parseInt(document.getElementById('breakTime').value),
            longBreakTime: parseInt(document.getElementById('longBreakTime').value),
            longBreakInterval: parseInt(document.getElementById('longBreakInterval').value),
            notificationsEnabled: document.getElementById('notificationsEnabled').checked,
            autoStartBreaks: document.getElementById('autoStartBreaks').checked
        };
        
        this.data.settings = settings;
        this.applySettings();
        this.saveData();
        this.hideSettingsModal();
        
        // If timer is not running, update the display
        if (!this.isRunning) {
            this.setupTimer();
            this.updateTimerDisplay();
        }
    }
    
    editTaskPrompt(id) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText !== null) {
                this.editTask(id, newText);
            }
        }
    }
    
    // Data Export/Import
    async exportData() {
        try {
            const result = await window.electronAPI.exportData();
            if (result.success) {
                this.showNotification('Export Successful', `Data exported to ${result.path}`);
            } else {
                this.showNotification('Export Failed', 'Could not export data');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Export Failed', 'An error occurred during export');
        }
    }
    
    async importData() {
        try {
            const result = await window.electronAPI.importData();
            if (result.success) {
                this.data = result.data;
                this.applySettings();
                this.updateUI();
                this.updateStats();
                this.showNotification('Import Successful', 'Data imported successfully');
            } else {
                this.showNotification('Import Failed', 'Could not import data');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            this.showNotification('Import Failed', 'An error occurred during import');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroApp = new PomodoroApp();
});
