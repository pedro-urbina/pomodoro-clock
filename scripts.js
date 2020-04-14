let initialWorkPeriod = 25;
const workPeriodDisplay = document.getElementById("work-value");
workPeriodDisplay.textContent = initialWorkPeriod;

let initialBreakPeriod = 5;
const breakPeriodDisplay = document.getElementById("break-value");
breakPeriodDisplay.textContent = initialBreakPeriod;

const clockHeader = document.getElementById("clock-header");
const clock = document.getElementById("clock");

const alertChime = document.getElementById("alert-chime");

const demoSwitch = document.querySelector("input");

let running = false;
let paused = false;

// Click Event Listeners
const buttons = document.querySelectorAll("button");
buttons.forEach(button => button.addEventListener('click', function (e) {
    handler(e.target.id);
}));

function handler(id) {
    const workPeriod = parseInt(document.getElementById("work-setting").value);
    const breakPeriod = parseInt(document.getElementById("break-setting").value);
    switch (id) {
        case "work-up":
            if (running || paused) break;        
            workPeriodDisplay.textContent = workTimer.incrementPeriod();
            break;

        case "work-down":
            if (running || paused) break;   
            workPeriodDisplay.textContent = workTimer.decrementPeriod();
            break;

        case "break-up":
            if (running || paused) break;   
            breakPeriodDisplay.textContent = breakTimer.incrementPeriod();
            break;

        case "break-down":
            if (running || paused) break;   
            breakPeriodDisplay.textContent = breakTimer.decrementPeriod();
            break;

        case "play":
            if (running) break;
            let interval = demoSwitch.checked ? 100 : 1000;
            demoSwitch.disabled = true;
            currentTimer.run(interval);
            addTomato();
            break;

        case "pause":
            currentTimer.pause();
            demoSwitch.disabled = false;
            break;
            
        case "stop":
            currentTimer.stop();
            currentTimer.reset();
            updateClock();
            removeLinealTomato();
            demoSwitch.disabled = false;
            break;

        case "default":
            workTimer.stop();
            workTimer.reset(initialWorkPeriod);
            breakTimer.stop();
            breakTimer.reset(initialBreakPeriod);
            workPeriodDisplay.textContent = initialWorkPeriod;
            breakPeriodDisplay.textContent = initialBreakPeriod;
            currentTimer = workTimer;
            clockHeader.textContent = currentTimer.type;
            updateClock();
            removeLinealTomato();
            demoSwitch.disabled = false;
            break;
    }
}

function updateClock(secondsRemaining, periodMinutes) {
    clock.textContent = currentTimer.toString();

    if (currentTimer === workTimer && running) {
        let periodSeconds = periodMinutes * 60;
        let secondsElapsed = periodSeconds - secondsRemaining;
        growTomato(secondsElapsed / periodSeconds);
    } 

    if (secondsRemaining <= 0) switchTimer();
}

function switchTimer() {
    alertChime.play();
    currentTimer.stop();
    currentTimer.reset();
    if (currentTimer === workTimer) {
        fillTomato();
        currentTimer = breakTimer;
    } else {
        addTomato();
        currentTimer = workTimer;
    }
    clockHeader.textContent = currentTimer.type;
    let interval = demoSwitch.checked ? 100 : 1000;
    currentTimer.run(interval);
}

// Tomato Functions ***************************

const tomatoCollection = document.getElementById("tomato-collection");
const tomatoSize = 64; //px

function addTomato() {
    const linealTomato = document.createElement("img");
    linealTomato.setAttribute("id", "tomato-lineal");
    linealTomato.setAttribute("src", "images/tomato-lineal.png");
    linealTomato.setAttribute("width", "0px");
    linealTomato.setAttribute("height", "auto");
    tomatoCollection.appendChild(linealTomato);
}

function growTomato(percentTimeElapsed) {
    const linealTomato = document.getElementById("tomato-lineal");
    linealTomato.setAttribute("width", `${percentTimeElapsed * tomatoSize}px`);
    console.log("Tomato size = " + percentTimeElapsed)
}

function fillTomato() {
    removeLinealTomato();
    const fullTomato = document.createElement("img");
    fullTomato.setAttribute("src", "images/tomato-full.png");
    fullTomato.setAttribute("margin-right", "20px");
    tomatoCollection.appendChild(fullTomato);
}

function removeLinealTomato() {
    const linealTomato = document.getElementById("tomato-lineal");
    linealTomato.parentNode.removeChild(linealTomato);
}

class Timer {
    constructor(hoursAtBeginning, minutesAtBeginning, secondsAtBeginning, type, period) {
        // the counters that represent hours, minutes and seconds are created and set to have the correct initial values
        this.hours = new BoundedCounter(23);
        this.minutes = new BoundedCounter(59);
        this.seconds = new BoundedCounter(59);
        this.type = type;
        this.period = period;

        while (minutesAtBeginning > 59) {
            minutesAtBeginning -= 60;
            hoursAtBeginning += 1;
        }
        
        this.hours.setValue(hoursAtBeginning);
        this.minutes.setValue(minutesAtBeginning);
        this.seconds.setValue(secondsAtBeginning);
    }

    reset(initPeriod) {
        if (initPeriod) 
            this.period = initPeriod;

        let hours = 0;
        let minutes = this.period;
        
        while (minutes > 59) {
            minutes -= 60;
            hours += 1;
        }
        
        this.hours.setValue(hours);
        this.minutes.setValue(minutes);
        this.seconds.setValue(0);
    }

    incrementPeriod() {
        this.tickUp(60);
        return ++this.period;
    }

    decrementPeriod() {
        if (this.period > 1) {
            this.tickDown(60);
            return --this.period;
        }
        return this.period;
    }

    run(interval) {
        let _this = this;
        running = setInterval(function(){_this.tickDown(1);}, interval);
    }

    pause() {
        clearInterval(running);
        running = false;
        paused = true;
    }

    stop() {
        clearInterval(running);
        running = false;
        paused = false;
    }
    
    tickDown(n) {
        for (let i = 0; i < n; i++) {
            // Timer decreases by one second   
            this.seconds.previous();
            if (this.seconds.getValue() == 59) {
                this.minutes.previous();
                if (this.minutes.getValue() == 59)
                    this.hours.previous();
            }
        }
        updateClock(this.timeRemaining(), this.period);
    }

    tickUp(n) {
        for (let i = 0; i < n; i++) {
            // Timer increases by one second
            this.seconds.next();
            if (this.seconds.getValue() == 0) {
                this.minutes.next();
                if (this.minutes.getValue() == 0)
                    this.hours.next();
            }
        }        
        updateClock(this.timeRemaining());
    }

    timeRemaining() {
        return this.hours.getValue() * 3600 + this.minutes.getValue() * 60 + this.seconds.getValue();
    }


    
    toString() {
        // returns the string representation
        if (this.hours.getValue() === 0)
            return this.minutes.toString() + ":" + this.seconds.toString();
        else
            return this.hours.toString() + ":" + this.minutes.toString() + ":" + this.seconds.toString();
    }
}

class BoundedCounter {
    constructor(upperLimit) {
        this.value = 0;
        this.upperLimit = upperLimit;
    }

    setValue(newValue) {
        if (newValue >= 0 && newValue <= this.upperLimit)
            this.value = newValue;
    }

    getValue() {
        return this.value;
    }

    next() {
        if (this.value == this.upperLimit)
            this.value = 0;
        else
            this.value += 1;
    }

    previous() {
        if (this.value == 0)
            this.value = this.upperLimit;
        else
            this.value -= 1
    }

    toString() {
        if (this.value < 10)
            return "0" + this.value;
        else
            return "" + this.value;
    }
}

const workTimer = new Timer(0, initialWorkPeriod, 0, "Work", initialWorkPeriod);
const breakTimer = new Timer(0, initialBreakPeriod, 0, "Break", initialBreakPeriod);
let currentTimer = workTimer;
clockHeader.textContent = currentTimer.type;
clock.textContent = currentTimer.toString();