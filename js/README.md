# JavaScript Module Structure

This directory contains the modularized JavaScript code for the Pomodoro Todo App.

## File Structure

### Core Modules
- **`app.js`** - Main application class that coordinates all modules
- **`utils.js`** - Utility functions and helper methods

### Feature Modules
- **`timer.js`** - Timer functionality (start, pause, stop, skip)
- **`tasks.js`** - Task management (add, edit, delete, toggle)
- **`history.js`** - History tracking and statistics
- **`settings.js`** - Settings management and validation
- **`modals.js`** - Modal dialogs management
- **`keyboard.js`** - Keyboard shortcuts handling

### Support Modules
- **`notifications.js`** - Notification system
- **`stats.js`** - Statistics calculation and display
- **`data-manager.js`** - Data persistence and import/export

## Module Dependencies

```
app.js (main coordinator)
├── utils.js (shared utilities)
├── timer.js
├── tasks.js
├── history.js
├── settings.js
├── modals.js
├── keyboard.js
├── notifications.js
├── stats.js
└── data-manager.js
```

## Benefits of This Structure

1. **Separation of Concerns** - Each module has a single responsibility
2. **Maintainability** - Easy to find and modify specific functionality
3. **Reusability** - Modules can be reused or replaced independently
4. **Testability** - Each module can be tested in isolation
5. **Readability** - Smaller, focused files are easier to understand
6. **Scalability** - Easy to add new features without affecting existing code

## Usage

All modules are automatically loaded by `index.html` in the correct order. The main `PomodoroApp` class coordinates all modules and provides a clean API.

## Module Communication

Modules communicate through the main app instance:
- Each module receives a reference to the main app
- Modules can access other modules through `this.app.moduleName`
- Data is shared through `this.app.data`
- Common functionality is available through `this.app.utils`
