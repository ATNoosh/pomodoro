# Pomodoro Todo App

A beautiful and feature-rich Pomodoro timer application with task management and history tracking, built with Electron.

## Features

### 🍅 Pomodoro Timer
- **Work Sessions**: 25-minute focused work periods (customizable)
- **Short Breaks**: 5-minute breaks between work sessions (customizable)
- **Long Breaks**: 15-minute breaks every 4 pomodoros (customizable)
- **Visual Progress**: Circular progress indicator with color coding
- **Auto-start**: Optional automatic break start
- **Notifications**: Desktop notifications for session completion

### ✅ Task Management
- **Add Tasks**: Create new tasks with descriptions
- **Complete Tasks**: Check off completed tasks
- **Edit Tasks**: Modify existing task descriptions
- **Delete Tasks**: Remove unwanted tasks
- **Task Counter**: Track completed tasks

### 📊 History & Statistics
- **Session History**: Complete log of all Pomodoro sessions
- **Daily Stats**: Track today's completed pomodoros
- **Time Tracking**: Monitor total focus time
- **Filter Options**: View history by day, week, month, or all time
- **Export/Import**: Backup and restore your data

### ⚙️ Customizable Settings
- **Timer Durations**: Adjust work, break, and long break times
- **Break Intervals**: Set how often long breaks occur
- **Notifications**: Enable/disable desktop notifications
- **Auto-start**: Control automatic break transitions

## Installation

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

## Usage

### Starting a Pomodoro Session
1. Click the **Start** button to begin a work session
2. The timer will count down from 25 minutes (or your custom setting)
3. When the session ends, you'll get a notification and the timer switches to break mode

### Managing Tasks
1. Click **Add Task** to create a new task
2. Type your task description and press Enter or click Save
3. Click the circle next to a task to mark it as complete
4. Use the edit (pencil) icon to modify a task
5. Use the delete (trash) icon to remove a task

### Viewing History
1. Click the **History** button (chart icon) in the header
2. Use the filter dropdown to view different time periods
3. See your total pomodoros, completed tasks, and focus time

### Customizing Settings
1. Click the **Settings** button (gear icon) in the header
2. Adjust timer durations, break intervals, and preferences
3. Click **Save Settings** to apply changes

### Data Management
- **Export**: Click the download icon to save your data to a JSON file
- **Import**: Click the upload icon to restore data from a JSON file

## Keyboard Shortcuts

- **Enter**: Save a new task when typing
- **Escape**: Cancel task input or close modals

## Data Storage

Your data is automatically saved locally and includes:
- All tasks and their completion status
- Complete history of Pomodoro sessions
- Your custom settings
- Daily statistics

## Building for Distribution

To create distributable packages:

```bash
npm run build
```

This will create installers for Windows, macOS, and Linux in the `dist` folder.

## Technical Details

- **Framework**: Electron
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: Local JSON file with automatic backup
- **Notifications**: Native desktop notifications
- **Icons**: Font Awesome
- **Styling**: Modern CSS with gradients and animations

## Customization

The app is fully customizable through the settings panel:
- Work time: 1-60 minutes
- Short break: 1-30 minutes  
- Long break: 1-60 minutes
- Long break interval: Every 2-10 pomodoros

## Troubleshooting

### Notifications not working
- Make sure notifications are enabled in your system settings
- Check that the app has notification permissions

### Data not saving
- Ensure the app has write permissions to your user data directory
- Try exporting your data as a backup

### App won't start
- Make sure you've run `npm install` to install dependencies
- Check that you have Node.js installed

## License

MIT License - feel free to modify and distribute as needed.

---

**Happy Pomodoro-ing! 🍅**
