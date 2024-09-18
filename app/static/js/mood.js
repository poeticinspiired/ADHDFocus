document.addEventListener('DOMContentLoaded', function() {
    const moodForm = document.getElementById('mood-form');
    const moodList = document.getElementById('mood-list');
    const moodRating = document.getElementById('mood-rating');
    const moodValue = document.getElementById('mood-value');
    const energyLevel = document.getElementById('energy-level');
    const energyValue = document.getElementById('energy-value');

    function updateSlider(slider, valueElement, isEnergy = false) {
        const value = slider.value;
        valueElement.textContent = value;
        
        // Update slider color
        const hue = isEnergy ? value * 12 : 120 - (value - 1) * 12; // 120 (green) to 0 (red) for mood, 0 to 120 for energy
        slider.style.background = `linear-gradient(to right, hsl(${hue}, 100%, 50%), hsl(${hue}, 100%, 70%))`;
        
        // Update emoji/icon size
        const emojis = isEnergy ? document.querySelectorAll('.energy-icon') : document.querySelectorAll('.mood-emoji');
        emojis.forEach((emoji, index) => {
            const size = 1 + (Math.abs(index - Math.floor(value / 3.5)) * 0.5);
            emoji.style.transform = `scale(${size})`;
            emoji.style.opacity = size > 1 ? 1 : 0.5;
        });
    }

    moodRating.addEventListener('input', () => updateSlider(moodRating, moodValue));
    energyLevel.addEventListener('input', () => updateSlider(energyLevel, energyValue, true));

    moodForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(moodForm);
        const moodData = Object.fromEntries(formData.entries());

        fetch('/api/moods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(moodData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Mood logged successfully:', data);
            moodForm.reset();
            loadRecentMoods();
            showNotification('Mood logged successfully!', 'success');
        })
        .catch(error => {
            console.error('Error logging mood:', error);
            showNotification('Error logging mood. Please try again.', 'error');
        });
    });

    function loadRecentMoods() {
        fetch('/api/moods')
        .then(response => response.json())
        .then(moods => {
            moodList.innerHTML = '';
            moods.forEach((mood, index) => {
                const moodElement = createMoodElement(mood);
                moodElement.style.animationDelay = `${index * 0.1}s`;
                moodList.appendChild(moodElement);
            });
        })
        .catch(error => console.error('Error loading moods:', error));
    }

    function createMoodElement(mood) {
        const moodElement = document.createElement('div');
        moodElement.className = 'mood-item slide-in';
        const moodEmoji = getMoodEmoji(mood.mood);
        const energyIcon = getEnergyIcon(mood.energy_level);
        moodElement.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-2xl">${moodEmoji}</span>
                <span class="text-xl">${energyIcon}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
                <p class="font-semibold text-gray-800 dark:text-gray-200">Mood: ${mood.mood}/10</p>
                <p class="text-gray-600 dark:text-gray-400">Energy: ${mood.energy_level}/10</p>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">${new Date(mood.created_at).toLocaleString()}</p>
            <p class="mt-2 text-gray-700 dark:text-gray-300">${mood.notes || 'No notes'}</p>
            <div class="mt-2 flex space-x-2">
                <div class="w-1/2 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div class="bg-gradient-to-r from-red-500 to-green-500 h-2.5 rounded-full" style="width: ${mood.mood * 10}%"></div>
                </div>
                <div class="w-1/2 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div class="bg-gradient-to-r from-blue-300 to-blue-600 h-2.5 rounded-full" style="width: ${mood.energy_level * 10}%"></div>
                </div>
            </div>
        `;
        return moodElement;
    }

    function getMoodEmoji(mood) {
        const emojis = ['😢', '😟', '😕', '😐', '🙂', '😊', '😄', '😃', '😁', '😆'];
        return emojis[Math.floor(mood) - 1] || '😐';
    }

    function getEnergyIcon(energy) {
        const icons = ['🔋', '🔋🔋', '🔋🔋🔋'];
        return icons[Math.floor((energy - 1) / 3.5)] || '🔋';
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    // Initialize sliders and load recent moods
    updateSlider(moodRating, moodValue);
    updateSlider(energyLevel, energyValue, true);
    loadRecentMoods();
});
