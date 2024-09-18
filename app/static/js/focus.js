let focusTimer;
let startTime;
let isRunning = false;
let focusScene, focusCamera, focusRenderer, focusCube;

document.addEventListener('DOMContentLoaded', function() {
    initFocus3D();
    const startButton = document.getElementById('start-focus');
    const endButton = document.getElementById('end-focus');

    if (startButton) {
        startButton.addEventListener('click', startFocusSession);
    }

    if (endButton) {
        endButton.addEventListener('click', endFocusSession);
    }
});

function updateTimerDisplay(time) {
    const timerDisplay = document.getElementById('focus-timer');
    gsap.to(timerDisplay, {
        textContent: time,
        duration: 0.5,
        ease: 'power2.out',
        snap: { textContent: 1 }
    });
}

function pulseAnimation() {
    const timerDisplay = document.getElementById('focus-timer');
    gsap.to(timerDisplay, {
        scale: 1.1,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
    });
}

function updateBackground(progress) {
    const background = document.getElementById('focus-background');
    const hue = 60 - (progress * 60); // Transition from yellow (60) to red (0)
    gsap.to(background, {
        background: `linear-gradient(to right bottom, hsl(${hue}, 100%, 50%), hsl(${hue}, 100%, 70%))`,
        duration: 1
    });
}

function startFocusSession() {
    const startButton = document.getElementById('start-focus');
    const endButton = document.getElementById('end-focus');
    const focusMessage = document.getElementById('focus-message');
    const focusContainer = document.getElementById('focus-container');

    gsap.to(startButton, { opacity: 0, display: 'none', duration: 0.5 });
    gsap.to(endButton, { opacity: 1, display: 'inline-block', duration: 0.5, delay: 0.5 });
    gsap.to(focusMessage, { 
        text: 'Focus session in progress...',
        duration: 1,
        ease: 'power2.out'
    });
    gsap.to(focusContainer, { 
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
        duration: 1
    });

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
        animateFocus3D(elapsedTime / 1500);
        
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

    gsap.to(startButton, { opacity: 1, display: 'inline-block', duration: 0.5, delay: 0.5 });
    gsap.to(endButton, { opacity: 0, display: 'none', duration: 0.5 });
    gsap.to(focusContainer, { 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        duration: 1
    });

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
        gsap.to(focusMessage, { 
            text: `Great job! You focused for ${duration} minutes.`,
            duration: 1,
            ease: 'power2.out'
        });
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

        gsap.to(confetti, {
            y: '100vh',
            rotation: Math.random() * 720 - 360,
            duration: Math.random() * 3 + 2,
            ease: 'power1.out'
        });
    }

    setTimeout(() => {
        gsap.to(confettiContainer, {
            opacity: 0,
            duration: 1,
            onComplete: () => confettiContainer.remove()
        });
    }, 5000);
}

function initFocus3D() {
    const container = document.getElementById('focus-3d-container');
    
    focusScene = new THREE.Scene();
    focusCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    focusRenderer = new THREE.WebGLRenderer({ alpha: true });
    
    focusRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(focusRenderer.domElement);
    
    const geometry = new THREE.TorusKnotGeometry(5, 1.5, 100, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true });
    focusCube = new THREE.Mesh(geometry, material);
    
    focusScene.add(focusCube);
    focusCamera.position.z = 20;
    
    animateFocus3D();
}

function animateFocus3D(progress = 0) {
    requestAnimationFrame(() => animateFocus3D(progress));
    focusCube.rotation.x += 0.01;
    focusCube.rotation.y += 0.01;
    focusCube.scale.setScalar(1 + progress * 0.5);
    focusRenderer.render(focusScene, focusCamera);
}
