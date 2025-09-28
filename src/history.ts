import { Utils } from './utils.js';
import { PomodoroApp, HistoryItem, HistoryStats } from './types.js';

// History management functionality for Pomodoro App
export class HistoryManager {
  private app: PomodoroApp;

  constructor(app: PomodoroApp) {
    this.app = app;
  }
  
  // Add a completed session to history
  addToHistory(): void {
    const historyItem: HistoryItem = {
      id: Utils.generateId(),
      type: this.app.timer.currentMode,
      duration: this.app.timer.totalTime,
      completedAt: new Date().toISOString(),
      pomodoroCount: this.app.timer.pomodoroCount
    };
    
    this.app.data.history.push(historyItem);
    this.app.saveData();
    this.app.stats.update();
  }
  
  // Render history with optional filter
  render(filter: string = 'all'): void {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    let filteredHistory = this.getFilteredHistory(filter);
    
    historyList.innerHTML = '';
    
    filteredHistory.reverse().forEach(item => {
      const historyElement = this.createHistoryElement(item);
      historyList.appendChild(historyElement);
    });
  }
  
  // Get filtered history based on time period
  private getFilteredHistory(filter: string): HistoryItem[] {
    let filteredHistory = this.app.data.history;
    const now = new Date();
    
    switch (filter) {
      case 'today':
        filteredHistory = this.app.data.history.filter((item: HistoryItem) => {
          return Utils.isToday(item.completedAt);
        });
        break;
      case 'week':
        const weekAgo = Utils.getDaysAgo(7);
        filteredHistory = this.app.data.history.filter((item: HistoryItem) => 
          new Date(item.completedAt) >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = Utils.getDaysAgo(30);
        filteredHistory = this.app.data.history.filter((item: HistoryItem) => 
          new Date(item.completedAt) >= monthAgo
        );
        break;
    }
    
    return filteredHistory;
  }
  
  // Create a single history element
  private createHistoryElement(item: HistoryItem): HTMLElement {
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
  
  // Get today's pomodoro count
  getTodayPomodoros(): number {
    const today = Utils.getTodayString();
    return this.app.data.history.filter((item: HistoryItem) => 
      item.type === 'work' && Utils.isToday(item.completedAt)
    ).length;
  }
  
  // Get total pomodoro count
  getTotalPomodoros(): number {
    return this.app.data.history.filter((item: HistoryItem) => item.type === 'work').length;
  }
  
  // Get total focus time in seconds
  getTotalFocusTime(): number {
    return this.app.data.history
      .filter((item: HistoryItem) => item.type === 'work')
      .reduce((sum: number, item: HistoryItem) => sum + item.duration, 0);
  }
  
  // Get total focus time in hours
  getTotalFocusTimeHours(): number {
    return Utils.secondsToHours(this.getTotalFocusTime());
  }
  
  // Get all history items
  getAllHistory(): HistoryItem[] {
    return this.app.data.history || [];
  }
  
  // Clear all history
  clearHistory(): void {
    this.app.data.history = [];
    this.app.saveData();
    this.app.stats.update();
  }
  
  // Export history data for CSV
  exportHistoryData(): string[][] {
    const headers = [
      'Type', 'Date', 'Time', 'Duration (minutes)', 'Pomodoro Count'
    ];
    
    const rows: string[][] = [headers];
    
    this.app.data.history.forEach((item: HistoryItem) => {
      const date = new Date(item.completedAt);
      const row = [
        item.type === 'work' ? 'Pomodoro' : 'Break',
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        Math.floor(item.duration / 60).toString(),
        item.pomodoroCount?.toString() || ''
      ];
      rows.push(row);
    });
    
    return rows;
  }
  
  // Get history statistics for a specific period
  getHistoryStats(period: string = 'all'): HistoryStats {
    const filteredHistory = this.getFilteredHistory(period);
    const workSessions = filteredHistory.filter(item => item.type === 'work');
    const breakSessions = filteredHistory.filter(item => item.type !== 'work');
    
    return {
      totalSessions: filteredHistory.length,
      workSessions: workSessions.length,
      breakSessions: breakSessions.length,
      totalFocusTime: workSessions.reduce((sum, item) => sum + item.duration, 0),
      averageSessionLength: workSessions.length > 0 ? 
        workSessions.reduce((sum, item) => sum + item.duration, 0) / workSessions.length : 0
    };
  }
}
