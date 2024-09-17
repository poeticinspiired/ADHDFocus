let focusTimer;
let startTime;

function startFocusSession() {
    const startButton = document.getElementById('start-focus');
    const endButton = document.getElementById('end-focus');
    const timerDisplay = document.getElementById('focus-timer');
    const focusMessage = document.getElementById('focus-message');

    startButton.style.display = 'none';
    endButton.style.display = 'inline-block';
    focusMessage.textContent = 'Focus session in progress...';

    startTime = Date.now();
    focusTimer = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    const startButton = document.getElementById('start-focus');
    const endButton = document.getElementById('end-focus');
    const focusMessage = document.getElementById('focus-message');

    startButton.style.display = 'inline-block';
    endButton.style.display = 'none';

    const duration = Math.floor((Date.now() - startTime) / 60000); // Duration in minutes

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
        focusMessage.textContent = `Great job! You earned ${data.points_earned} points for your ${duration}-minute focus session.`;
        updateUserPoints();
    })
    .catch(error => console.error('Error ending focus session:', error));
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
