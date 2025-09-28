// Timer functionality for Pomodoro App
class Timer {
    constructor(app) {
        this.app = app;
        this.timer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.totalTime = 0;
        this.currentMode = 'work'; // work, break, long-break
        this.pomodoroCount = 0;
        this.longBreakInterval = 4;
    }
    
    // Timer control methods
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            
            if (this.currentTime === 0) {
                this.setup();
                this.updateDisplay();
            }
            
            this.timer = setInterval(() => {
                this.tick();
            }, 1000);
            
            this.updateButtons();
        }
    }
    
    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            clearInterval(this.timer);
            this.updateButtons();
        }
    }
    
    resume() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.timer = setInterval(() => {
                this.tick();
            }, 1000);
            this.updateButtons();
        }
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timer);
        this.currentTime = 0;
        this.updateDisplay();
        this.updateButtons();
    }
    
    skip() {
        this.stop();
        this.nextMode();
    }
    
    // Setup timer based on current mode
    setup() {
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
    }
    
    // Timer tick - called every second
    tick() {
        this.currentTime--;
        this.updateDisplay();
        
        if (this.currentTime <= 0) {
            this.complete();
        }
    }
    
    // Called when timer completes
    complete() {
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
    nextMode() {
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
    }
    
    // Update timer display
    updateDisplay() {
        const display = Utils.formatTime(this.currentTime);
        document.getElementById('timerDisplay').textContent = display;
        
        // Update mode text
        const modeText = {
            'work': 'Work Time',
            'break': 'Short Break',
            'long-break': 'Long Break'
        };
        document.getElementById('timerMode').textContent = modeText[this.currentMode];
        
        // Update progress circle
        const progress = ((this.totalTime - this.currentTime) / this.totalTime) * 283;
        const progressCircle = document.getElementById('timerProgress');
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = 283 - progress;
            progressCircle.setAttribute('class', `timer-progress ${this.currentMode}`);
        }
    }
    
    // Update timer control buttons
    updateButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const skipBtn = document.getElementById('skipBtn');
        
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
    updateLongBreakInterval(interval) {
        this.longBreakInterval = interval;
    }
    
    // Get current timer state
    getState() {
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
