import * as THREE from 'three';

let focusTimer;
let startTime;
let scene, camera, renderer, cube;

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('focus-3d').appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

function startFocusSession() {
    const startButton = document.getElementById('start-focus');
    const endButton = document.getElementById('end-focus');
    const timerDisplay = document.getElementById('focus-timer');
    const focusMessage = document.getElementById('focus-message');

    startButton.style.display = 'none';
    endButton.style.display = 'inline-block';
    focusMessage.textContent = 'Focus session in progress...';
    focusMessage.classList.add('text-yellow-500');

    startTime = Date.now();
    focusTimer = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update 3D cube rotation speed based on elapsed time
        cube.rotation.x = elapsedTime * 0.01;
        cube.rotation.y = elapsedTime * 0.01;
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
        focusMessage.textContent = `Great job! You focused for ${duration} minutes.`;
        focusMessage.classList.remove('text-yellow-500');
        focusMessage.classList.add('text-green-500');
    })
    .catch(error => console.error('Error ending focus session:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    
    const startButton = document.getElementById('start-focus');
    const endButton = document.getElementById('end-focus');

    if (startButton) {
        startButton.addEventListener('click', startFocusSession);
    }

    if (endButton) {
        endButton.addEventListener('click', endFocusSession);
    }
});

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
