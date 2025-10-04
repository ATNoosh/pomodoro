// Main entry point for the application
import { PomodoroApp } from './app.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new PomodoroApp();
    app.init();
});
