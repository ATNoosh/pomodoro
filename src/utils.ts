// Utility functions for Pomodoro App
export class Utils {
  // Escape HTML to prevent XSS attacks
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Format time in MM:SS format
  static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  // Convert seconds to hours for display
  static secondsToHours(seconds: number): number {
    return Math.floor(seconds / 3600);
  }
  
  // Get current date string for comparison
  static getTodayString(): string {
    return new Date().toDateString();
  }
  
  // Check if a date is today
  static isToday(dateString: string): boolean {
    return new Date(dateString).toDateString() === this.getTodayString();
  }
  
  // Get date N days ago
  static getDaysAgo(days: number): Date {
    const now = new Date();
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }
  
  // Convert data to CSV format
  static convertToCSV(data: string[][]): string {
    if (!data || data.length === 0) return '';
    
    // Get headers
    const headers = data[0];
    const csvContent = [
      headers.join(','),
      ...data.slice(1).map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
  
  // Prepare data for Google Sheets export
  static prepareDataForGoogleSheets(history: any[], tasks: any[]): string[][] {
    const headers = [
      'Type', 'Date', 'Time', 'Duration (minutes)', 'Pomodoro Count', 'Task', 'Status'
    ];
    
    const rows: string[][] = [headers];
    
    // Add history data
    history.forEach(item => {
      const date = new Date(item.completedAt);
      const row = [
        item.type === 'work' ? 'Pomodoro' : 'Break',
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        Math.floor(item.duration / 60).toString(),
        item.pomodoroCount || '',
        '', // Task will be filled from tasks data
        'Completed'
      ];
      rows.push(row);
    });
    
    // Add tasks data
    tasks.forEach(task => {
      const date = new Date(task.createdAt);
      const row = [
        'Task',
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        '',
        '',
        task.text,
        task.completed ? 'Completed' : 'Pending'
      ];
      rows.push(row);
    });
    
    return rows;
  }
  
  // Generate unique ID
  static generateId(): number {
    return Date.now();
  }
  
  // Validate task text
  static validateTaskText(text: string): boolean {
    return Boolean(text && text.trim().length > 0 && text.trim().length <= 200);
  }
  
  // Show confirmation dialog
  static confirm(message: string): boolean {
    return confirm(message);
  }
  
  // Show prompt dialog
  static prompt(message: string, defaultValue: string = ''): string | null {
    return prompt(message, defaultValue);
  }
}
