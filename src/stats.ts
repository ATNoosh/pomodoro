import { PomodoroApp, TodayStats, AllTimeStats } from './types.js';

// Statistics management functionality for Pomodoro App
export class StatsManager {
  private app: PomodoroApp;

  constructor(app: PomodoroApp) {
    this.app = app;
  }
  
  // Update all statistics
  update(): void {
    this.updateTodayStats();
    this.updateHistoryStats();
  }
  
  // Update today's statistics
  private updateTodayStats(): void {
    const todayPomodoros = this.app.history.getTodayPomodoros();
    const completedTasks = this.app.tasks.getCompletedTasksCount();
    
    const todayPomodorosEl = document.getElementById('todayPomodoros');
    const completedTasksEl = document.getElementById('completedTasks');
    
    if (todayPomodorosEl) {
      todayPomodorosEl.textContent = todayPomodoros.toString();
    }
    if (completedTasksEl) {
      completedTasksEl.textContent = completedTasks.toString();
    }
  }
  
  // Update history statistics
  private updateHistoryStats(): void {
    const totalPomodoros = this.app.history.getTotalPomodoros();
    const totalTasks = this.app.tasks.getCompletedTasksCount();
    const totalTime = this.app.history.getTotalFocusTimeHours();
    
    const totalPomodorosEl = document.getElementById('totalPomodoros');
    const totalTasksEl = document.getElementById('totalTasks');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (totalPomodorosEl) {
      totalPomodorosEl.textContent = totalPomodoros.toString();
    }
    if (totalTasksEl) {
      totalTasksEl.textContent = totalTasks.toString();
    }
    if (totalTimeEl) {
      totalTimeEl.textContent = `${totalTime}h`;
    }
  }
  
  // Get today's statistics
  getTodayStats(): TodayStats {
    return {
      pomodoros: this.app.history.getTodayPomodoros(),
      completedTasks: this.app.tasks.getCompletedTasksCount()
    };
  }
  
  // Get all-time statistics
  getAllTimeStats(): AllTimeStats {
    return {
      totalPomodoros: this.app.history.getTotalPomodoros(),
      totalTasks: this.app.tasks.getCompletedTasksCount(),
      totalFocusTime: this.app.history.getTotalFocusTimeHours()
    };
  }
}
