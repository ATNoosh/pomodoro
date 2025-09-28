# TypeScript Source Code

This directory contains the TypeScript source code for the Pomodoro Todo App.

## File Structure

### Core Files
- **`types.ts`** - Type definitions and interfaces
- **`app.ts`** - Main application class (coordinates all modules)
- **`utils.ts`** - Utility functions and helper methods

### Feature Modules
- **`timer.ts`** - Timer functionality (start, pause, stop, skip)
- **`tasks.ts`** - Task management (add, edit, delete, toggle)
- **`history.ts`** - History tracking and statistics
- **`settings.ts`** - Settings management and validation
- **`modals.ts`** - Modal dialogs management
- **`keyboard.ts`** - Keyboard shortcuts handling

### Support Modules
- **`notifications.ts`** - Notification system
- **`stats.ts`** - Statistics calculation and display
- **`data-manager.ts`** - Data persistence and import/export

## TypeScript Features

### Type Safety
- **Strict typing** for all variables, functions, and parameters
- **Interface definitions** for data structures
- **Generic types** for reusable components
- **Type guards** for runtime type checking

### Modern JavaScript Features
- **ES2020** target with modern syntax
- **Async/await** for asynchronous operations
- **Arrow functions** and destructuring
- **Template literals** and optional chaining

### Development Experience
- **IntelliSense** support in IDEs
- **Compile-time error checking**
- **Refactoring support**
- **Auto-completion** and documentation

## Build Process

1. **Development**: `npm run dev:watch` - Watch mode with auto-compilation
2. **Build**: `npm run build` - Compile TypeScript to JavaScript
3. **Start**: `npm start` - Build and run the application

## Type Definitions

### Core Types
```typescript
interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  pomodoros: number;
}

interface Settings {
  workTime: number;
  breakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
  notificationsEnabled: boolean;
  autoStartBreaks: boolean;
}
```

### Module Interfaces
Each module has a clear interface with typed methods and properties, making the code more maintainable and easier to understand.

## Benefits of TypeScript

1. **Type Safety** - Catch errors at compile time
2. **Better IDE Support** - Enhanced autocomplete and refactoring
3. **Documentation** - Types serve as inline documentation
4. **Maintainability** - Easier to refactor and modify code
5. **Team Collaboration** - Clear contracts between modules
6. **Scalability** - Better structure for growing applications

## Compilation

TypeScript files are compiled to the `dist/` directory and loaded by `index.html`. The build process ensures all dependencies are resolved and the output is optimized for production.
