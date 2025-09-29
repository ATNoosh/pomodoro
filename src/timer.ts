import { Utils } from './utils.js';
import { PomodoroApp, TimerState } from './types.js';

// Timer functionality for Pomodoro App
export class Timer {
  private app: PomodoroApp;
  private timer: NodeJS.Timeout | null = null;
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  private currentTime: number = 0;
  private totalTime: number = 0;
  private currentMode: 'work' | 'break' | 'long-break' = 'work';
  private pomodoroCount: number = 0;
  private longBreakInterval: number = 4;

  constructor(app: PomodoroApp) {
    this.app = app;
  }
  
  // Emit timer state for overlay via preload-exposed API
  private emitTick(): void {
    try {
      const api = (window as any).electronAPI;
      if (api && typeof api.timerTick === 'function') {
        api.timerTick(this.getState());
      }
    } catch {
      // not in renderer context
    }
  }
  
  // Timer control methods
  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      
      if (this.currentTime === 0) {
        this.setup();
        this.updateDisplay();
        this.emitTick();
      }
      
      this.timer = setInterval(() => {
        this.tick();
      }, 1000);
      
      this.updateButtons();
      this.emitTick();
    }
  }
  
  pause(): void {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.updateButtons();
    }
  }
  
  resume(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.timer = setInterval(() => {
        this.tick();
      }, 1000);
      this.updateButtons();
    }
  }
  
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.currentTime = 0;
    this.updateDisplay();
    this.updateButtons();
    this.emitTick();
  }
  
  skip(): void {
    this.stop();
    this.nextMode();
  }
  
  // Setup timer based on current mode
  setup(): void {
    const settings = this.app.data.settings;
    
    switch (this.currentMode) {
      case 'work':
        this.totalTime = settings.workTime * 60;
        break;
      case 'break':
        this.totalTime = settings.breakTime * 60;
        break;
      case 'long-break':
        this.totalTime = settings.longBreakTime * 60;
        break;
    }
    
    this.currentTime = this.totalTime;
    this.updateDisplay();
    this.emitTick();
  }
  
  // Timer tick - called every second
  private tick(): void {
    this.currentTime--;
    this.updateDisplay();
    this.emitTick();
    
    if (this.currentTime <= 0) {
      this.complete();
    }
  }
  
  // Called when timer completes
  private complete(): void {
    this.stop();
    this.app.history.addToHistory();
    
    if (this.currentMode === 'work') {
      this.pomodoroCount++;
      this.app.notifications.show('Pomodoro Complete!', 'Time for a break!');
    } else {
      this.app.notifications.show('Break Complete!', 'Ready to work?');
    }
    
    this.nextMode();
    
    if (this.app.data.settings.autoStartBreaks && this.currentMode !== 'work') {
      setTimeout(() => {
        this.start();
      }, 2000);
    }
  }
  
  // Switch to next mode
  private nextMode(): void {
    if (this.currentMode === 'work') {
      if (this.pomodoroCount % this.longBreakInterval === 0) {
        this.currentMode = 'long-break';
      } else {
        this.currentMode = 'break';
      }
    } else {
      this.currentMode = 'work';
    }
    
    this.setup();
    this.updateDisplay();
    this.emitTick();
  }
  
  // Update timer display
  updateDisplay(): void {
    const display = Utils.formatTime(this.currentTime);
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
      timerDisplay.textContent = display;
    }
    
    // Update mode text
    const modeText = {
      'work': 'Work Time',
      'break': 'Short Break',
      'long-break': 'Long Break'
    };
    const timerMode = document.getElementById('timerMode');
    if (timerMode) {
      timerMode.textContent = modeText[this.currentMode];
    }
    
    // Update progress circle
    const progress = ((this.totalTime - this.currentTime) / this.totalTime) * 283;
    const progressCircle = document.getElementById('timerProgress');
    if (progressCircle) {
      progressCircle.style.strokeDashoffset = (283 - progress).toString();
      progressCircle.setAttribute('class', `timer-progress ${this.currentMode}`);
    }
  }
  
  // Update timer control buttons
  updateButtons(): void {
    const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
    const skipBtn = document.getElementById('skipBtn') as HTMLButtonElement;
    
    if (!this.isRunning) {
      startBtn.disabled = false;
      startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
      skipBtn.disabled = true;
    } else if (this.isPaused) {
      startBtn.disabled = false;
      startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
      pauseBtn.disabled = true;
      stopBtn.disabled = false;
      skipBtn.disabled = false;
    } else {
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      skipBtn.disabled = false;
    }
  }
  
  // Update long break interval from settings
  updateLongBreakInterval(interval: number): void {
    this.longBreakInterval = interval;
  }
  
  // Get current timer state
  getState(): TimerState {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentTime: this.currentTime,
      totalTime: this.totalTime,
      currentMode: this.currentMode,
      pomodoroCount: this.pomodoroCount
    };
  }
}
