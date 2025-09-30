import { Utils } from './utils.js';
import { PomodoroApp, Task } from './types.js';

// Task management functionality for Pomodoro App
export class TaskManager {
  private app: PomodoroApp;
  private selectedTaskId: number | null = null;
  private pendingDueDateISO: string | null = null;

  constructor(app: PomodoroApp) {
    this.app = app;
  }
  
  // Add a new task
  addTask(text: string): void {
    if (Utils.validateTaskText(text)) {
      const task: Task = {
        id: Utils.generateId(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        pomodoros: 0,
        dueDate: (this.pendingDueDateISO || this.getSelectedDateISO())
      };
      
      this.app.data.tasks.push(task);
      this.app.saveData();
      this.render();
      this.app.stats.update();
      this.pendingDueDateISO = null;
    }
  }
  
  // Toggle task completion status
  toggleTask(id: number): void {
    const task = this.app.data.tasks.find((t: Task) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.app.saveData();
      this.render();
      this.app.stats.update();
    }
  }
  
  // Edit task text
  editTask(id: number, newText: string): void {
    const task = this.app.data.tasks.find((t: Task) => t.id === id);
    if (task && Utils.validateTaskText(newText)) {
      task.text = newText.trim();
      // Apply pending due date if provided
      if (this.pendingDueDateISO) {
        task.dueDate = this.pendingDueDateISO;
        this.pendingDueDateISO = null;
      }
      this.app.saveData();
      this.render();
    }
  }
  
  // Delete a task
  deleteTask(id: number): void {
    this.app.data.tasks = this.app.data.tasks.filter((t: Task) => t.id !== id);
    this.app.saveData();
    this.render();
    this.app.stats.update();
    
    // Clear selection if deleted task was selected
    if (this.selectedTaskId === id) {
      this.selectedTaskId = null;
    }
  }
  
  // Render all tasks
  render(): void {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) {
      console.error('tasksList element not found');
      return;
    }
    
    console.log('renderTasks called, tasks count:', this.app.data.tasks ? this.app.data.tasks.length : 0);
    
    tasksList.innerHTML = '';
    
    if (this.app.data.tasks && this.app.data.tasks.length > 0) {
      const selectedISO = this.getSelectedDateISO();
      const tasksForDay = this.app.data.tasks.filter((t: Task) => (t.dueDate || this.dateFromISO(t.createdAt)) === selectedISO);
      tasksForDay.forEach((task: Task) => {
        const taskElement = this.createTaskElement(task);
        tasksList.appendChild(taskElement);
      });
      console.log('Tasks rendered successfully');
    } else {
      console.log('No tasks to render');
    }
  }
  
  // Create a single task element
  private createTaskElement(task: Task): HTMLElement {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''} ${this.selectedTaskId === task.id ? 'selected' : ''}`;
    div.dataset.id = task.id.toString();
    div.tabIndex = 0; // Make focusable
    div.innerHTML = `
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
      <div class="task-text">${Utils.escapeHtml(task.text)}</div>
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
  
  // Select a task
  selectTask(id: number): void {
    this.selectedTaskId = id;
    this.render(); // Re-render to update selection
  }
  
  // Navigate between tasks with arrow keys
  navigateTasks(direction: number): void {
    // Navigate within currently visible (filtered-by-date) tasks
    if (this.app.data.tasks.length === 0) return;
    const selectedISO = this.getSelectedDateISO();
    const visibleTasks = this.app.data.tasks.filter((t: Task) => (t.dueDate || this.dateFromISO(t.createdAt)) === selectedISO);
    if (visibleTasks.length === 0) return;
    
    let currentIndex = -1;
    if (this.selectedTaskId) {
      currentIndex = visibleTasks.findIndex((task: Task) => task.id === this.selectedTaskId);
    }
    
    let newIndex = currentIndex + direction;
    
    // Wrap around
    if (newIndex < 0) {
      newIndex = visibleTasks.length - 1;
    } else if (newIndex >= visibleTasks.length) {
      newIndex = 0;
    }
    
    this.selectTask(visibleTasks[newIndex].id);
  }
  
  // Show task input form
  showTaskInput(): void {
    console.log('showTaskInput called');
    const container = document.getElementById('taskInputContainer');
    const input = document.getElementById('taskInput') as HTMLInputElement;
    
    if (!container || !input) {
      console.error('Task input elements not found');
      return;
    }
    
    // Ensure input is enabled and focusable
    input.disabled = false;
    input.readOnly = false;
    input.style.pointerEvents = 'auto';
    input.value = '';
    
    container.style.display = 'block';
    
    // Use setTimeout to ensure DOM is updated before focusing
    setTimeout(() => {
      input.focus();
      console.log('Task input focused');
    }, 50);
  }
  
  // Hide task input form
  hideTaskInput(): void {
    const container = document.getElementById('taskInputContainer');
    const input = document.getElementById('taskInput') as HTMLInputElement;
    if (container) container.style.display = 'none';
    if (input) {
      input.value = '';
      input.disabled = false;
      input.readOnly = false;
      input.style.pointerEvents = 'auto';
    }
  }
  
  // Show edit task prompt
  editTaskPrompt(id: number): void {
    const task = this.app.data.tasks.find((t: Task) => t.id === id);
    if (!task) return;
    const newText = Utils.prompt('Edit task text:', task.text);
    if (newText === null) return;
    // Ask for due date (YYYY-MM-DD). Empty keeps current.
    const currentDue = task.dueDate || this.dateFromISO(task.createdAt);
    const newDue = Utils.prompt('Edit due date (YYYY-MM-DD):', currentDue);
    if (newDue && /^\d{4}-\d{2}-\d{2}$/.test(newDue)) {
      this.setNextDueDate(newDue);
    }
    this.editTask(id, newText);
  }
  
  // Handle task list click events
  handleTaskClick(e: Event): void {
    const target = e.target as HTMLElement;
    const taskItem = target.closest('.task-item') as HTMLElement;
    const checkbox = target.closest('.task-checkbox') as HTMLElement;
    const editBtn = target.closest('.edit-btn') as HTMLElement;
    const deleteBtn = target.closest('.delete-btn') as HTMLElement;
    
    if (taskItem && !checkbox && !editBtn && !deleteBtn) {
      // Select task when clicking on task item (not on buttons)
      const id = parseInt(taskItem.dataset.id || '0');
      this.selectTask(id);
    } else if (checkbox) {
      const id = parseInt(checkbox.dataset.id || '0');
      this.toggleTask(id);
    } else if (editBtn) {
      const id = parseInt(editBtn.dataset.id || '0');
      this.editTaskPrompt(id);
    } else if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id || '0');
      if (Utils.confirm('Are you sure you want to delete this task?')) {
        this.deleteTask(id);
      }
    }
  }
  
  // Handle task input events
  handleTaskInput(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      const input = document.getElementById('taskInput') as HTMLInputElement;
      this.addTask(input.value);
      this.hideTaskInput();
    }
  }
  
  // Get selected task ID
  getSelectedTaskId(): number | null {
    return this.selectedTaskId;
  }
  
  // Get all tasks
  getAllTasks(): Task[] {
    return this.app.data.tasks || [];
  }
  
  // Get completed tasks count
  getCompletedTasksCount(): number {
    const selectedISO = this.getSelectedDateISO();
    return this.app.data.tasks.filter((task: Task) => (task.dueDate || this.dateFromISO(task.createdAt)) === selectedISO && task.completed).length;
  }

  // Helpers for date selection (default: today)
  getSelectedDateISO(): string {
    // Prefer the filter picker used in UI; fallback to legacy id
    const picker = (document.getElementById('taskFilterDate') || document.getElementById('taskDate')) as HTMLInputElement | null;
    if (picker && picker.value) return picker.value;
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }

  private dateFromISO(iso: string): string {
    try { return new Date(iso).toISOString().slice(0, 10); } catch { return this.getSelectedDateISO(); }
  }

  // Allow external to set desired due date before add/edit
  setNextDueDate(iso: string): void {
    this.pendingDueDateISO = iso;
  }
}
