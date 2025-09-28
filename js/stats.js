// Statistics management functionality for Pomodoro App
class StatsManager {
    constructor(app) {
        this.app = app;
    }
    
    // Update all statistics
    update() {
        this.updateTodayStats();
        this.updateHistoryStats();
    }
    
    // Update today's statistics
    updateTodayStats() {
        const todayPomodoros = this.app.history.getTodayPomodoros();
        const completedTasks = this.app.tasks.getCompletedTasksCount();
        
        const todayPomodorosEl = document.getElementById('todayPomodoros');
        const completedTasksEl = document.getElementById('completedTasks');
        
        if (todayPomodorosEl) {
            todayPomodorosEl.textContent = todayPomodoros;
        }
        if (completedTasksEl) {
            completedTasksEl.textContent = completedTasks;
        }
    }
    
    // Update history statistics
    updateHistoryStats() {
        const totalPomodoros = this.app.history.getTotalPomodoros();
        const totalTasks = this.app.tasks.getCompletedTasksCount();
        const totalTime = this.app.history.getTotalFocusTimeHours();
        
        const totalPomodorosEl = document.getElementById('totalPomodoros');
        const totalTasksEl = document.getElementById('totalTasks');
        const totalTimeEl = document.getElementById('totalTime');
        
        if (totalPomodorosEl) {
            totalPomodorosEl.textContent = totalPomodoros;
        }
        if (totalTasksEl) {
            totalTasksEl.textContent = totalTasks;
        }
        if (totalTimeEl) {
            totalTimeEl.textContent = `${totalTime}h`;
        }
    }
    
    // Get today's statistics
    getTodayStats() {
        return {
            pomodoros: this.app.history.getTodayPomodoros(),
            completedTasks: this.app.tasks.getCompletedTasksCount()
        };
    }
    
    // Get all-time statistics
    getAllTimeStats() {
        return {
            totalPomodoros: this.app.history.getTotalPomodoros(),
            totalTasks: this.app.tasks.getCompletedTasksCount(),
            totalFocusTime: this.app.history.getTotalFocusTimeHours()
        };
    }
}
