// Task management functionality for Pomodoro App
class TaskManager {
    constructor(app) {
        this.app = app;
        this.selectedTaskId = null;
    }
    
    // Add a new task
    addTask(text) {
        if (Utils.validateTaskText(text)) {
            const task = {
                id: Utils.generateId(),
                text: text.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
                pomodoros: 0
            };
            
            this.app.data.tasks.push(task);
            this.app.saveData();
            this.render();
            this.app.stats.update();
        }
    }
    
    // Toggle task completion status
    toggleTask(id) {
        const task = this.app.data.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.app.saveData();
            this.render();
            this.app.stats.update();
        }
    }
    
    // Edit task text
    editTask(id, newText) {
        const task = this.app.data.tasks.find(t => t.id === id);
        if (task && Utils.validateTaskText(newText)) {
            task.text = newText.trim();
            this.app.saveData();
            this.render();
        }
    }
    
    // Delete a task
    deleteTask(id) {
        this.app.data.tasks = this.app.data.tasks.filter(t => t.id !== id);
        this.app.saveData();
        this.render();
        this.app.stats.update();
        
        // Clear selection if deleted task was selected
        if (this.selectedTaskId === id) {
            this.selectedTaskId = null;
        }
    }
    
    // Render all tasks
    render() {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) {
            console.error('tasksList element not found');
            return;
        }
        
        console.log('renderTasks called, tasks count:', this.app.data.tasks ? this.app.data.tasks.length : 0);
        
        tasksList.innerHTML = '';
        
        if (this.app.data.tasks && this.app.data.tasks.length > 0) {
            this.app.data.tasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                tasksList.appendChild(taskElement);
            });
            console.log('Tasks rendered successfully');
        } else {
            console.log('No tasks to render');
        }
    }
    
    // Create a single task element
    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''} ${this.selectedTaskId === task.id ? 'selected' : ''}`;
        div.dataset.id = task.id;
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
    selectTask(id) {
        this.selectedTaskId = id;
        this.render(); // Re-render to update selection
    }
    
    // Navigate between tasks with arrow keys
    navigateTasks(direction) {
        if (this.app.data.tasks.length === 0) return;
        
        let currentIndex = -1;
        if (this.selectedTaskId) {
            currentIndex = this.app.data.tasks.findIndex(task => task.id === this.selectedTaskId);
        }
        
        let newIndex = currentIndex + direction;
        
        // Wrap around
        if (newIndex < 0) {
            newIndex = this.app.data.tasks.length - 1;
        } else if (newIndex >= this.app.data.tasks.length) {
            newIndex = 0;
        }
        
        this.selectTask(this.app.data.tasks[newIndex].id);
    }
    
    // Show task input form
    showTaskInput() {
        console.log('showTaskInput called');
        const container = document.getElementById('taskInputContainer');
        const input = document.getElementById('taskInput');
        
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
    hideTaskInput() {
        const container = document.getElementById('taskInputContainer');
        const input = document.getElementById('taskInput');
        container.style.display = 'none';
        input.value = '';
        
        // Ensure input is re-enabled and focusable
        input.disabled = false;
        input.readOnly = false;
        input.style.pointerEvents = 'auto';
    }
    
    // Show edit task prompt
    editTaskPrompt(id) {
        const task = this.app.data.tasks.find(t => t.id === id);
        if (task) {
            const newText = Utils.prompt('Edit task:', task.text);
            if (newText !== null) {
                this.editTask(id, newText);
            }
        }
    }
    
    // Handle task list click events
    handleTaskClick(e) {
        const taskItem = e.target.closest('.task-item');
        const checkbox = e.target.closest('.task-checkbox');
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        
        if (taskItem && !checkbox && !editBtn && !deleteBtn) {
            // Select task when clicking on task item (not on buttons)
            const id = parseInt(taskItem.dataset.id);
            this.selectTask(id);
        } else if (checkbox) {
            const id = parseInt(checkbox.dataset.id);
            this.toggleTask(id);
        } else if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            this.editTaskPrompt(id);
        } else if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            if (Utils.confirm('Are you sure you want to delete this task?')) {
                this.deleteTask(id);
            }
        }
    }
    
    // Handle task input events
    handleTaskInput(e) {
        if (e.key === 'Enter') {
            const input = document.getElementById('taskInput');
            this.addTask(input.value);
            this.hideTaskInput();
        }
    }
    
    // Get selected task ID
    getSelectedTaskId() {
        return this.selectedTaskId;
    }
    
    // Get all tasks
    getAllTasks() {
        return this.app.data.tasks || [];
    }
    
    // Get completed tasks count
    getCompletedTasksCount() {
        return this.app.data.tasks.filter(task => task.completed).length;
    }
}
