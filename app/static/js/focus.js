let focusTimer;
let startTime;
let isRunning = false;

function updateTimerDisplay(time) {
    const timerDisplay = document.getElementById('focus-timer');
    timerDisplay.textContent = time;
}

function pulseAnimation() {
    const timerDisplay = document.getElementById('focus-timer');
    timerDisplay.classList.add('pulse');
}

function updateBackground(progress) {
    const background = document.getElementById('focus-background');
    const hue = 60 - (progress * 60); // Transition from yellow (60) to red (0)
    background.style.background = `linear-gradient(to right bottom, hsl(${hue}, 100%, 50%), hsl(${hue}, 100%, 70%))`;
}

function startFocusSession() {
    const startButton = document.getElementById('start-focus');
    const endButton = document.getElementById('end-focus');
    const focusMessage = document.getElementById('focus-message');
    const focusContainer = document.getElementById('focus-container');

    startButton.style.display = 'none';
    endButton.style.display = 'inline-block';
    focusMessage.textContent = 'Focus session in progress...';
    focusMessage.classList.add('text-yellow-500');
    focusContainer.classList.add('focus-active');

    updateTimerDisplay('25:00');
    pulseAnimation();

    startTime = Date.now();
    isRunning = true;
    focusTimer = setInterval(() => {
        if (!isRunning) return;
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = Math.max(1500 - elapsedTime, 0);
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        updateTimerDisplay(time);
        updateBackground(elapsedTime / 1500);
        
        if (remainingTime === 0) {
            endFocusSession();
        }
    }, 1000);

    fetch('/api/focus/start', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => console.log('Focus session started:', data))
    .catch(error => console.error('Error starting focus session:', error));
}

function endFocusSession() {
    clearInterval(focusTimer);
    isRunning = false;
    const startButton = document.getElementById('start-focus');
    const endButton = document.getElementById('end-focus');
    const focusMessage = document.getElementById('focus-message');
    const focusContainer = document.getElementById('focus-container');

    startButton.style.display = 'inline-block';
    endButton.style.display = 'none';
    focusContainer.classList.remove('focus-active');

    const duration = Math.floor((Date.now() - startTime) / 60000);

    fetch('/api/focus/end', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration: duration }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Focus session ended:', data);
        focusMessage.textContent = `Great job! You focused for ${duration} minutes.`;
        focusMessage.classList.remove('text-yellow-500');
        focusMessage.classList.add('text-green-500');
        showConfetti();
    })
    .catch(error => console.error('Error ending focus session:', error));
}

function showConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.id = 'confetti-container';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random() * 3}s`;
        confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
        confettiContainer.remove();
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-focus');
    const endButton = document.getElementById('end-focus');

    if (startButton) {
        startButton.addEventListener('click', startFocusSession);
    }

    if (endButton) {
        endButton.addEventListener('click', endFocusSession);
    }
});
