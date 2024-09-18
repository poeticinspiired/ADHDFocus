document.addEventListener('DOMContentLoaded', function() {
    const moodForm = document.getElementById('mood-form');
    const moodList = document.getElementById('mood-list');
    const moodRating = document.getElementById('mood-rating');
    const moodValue = document.getElementById('mood-value');
    const energyLevel = document.getElementById('energy-level');
    const energyValue = document.getElementById('energy-value');

    function updateRangeValue(range, valueElement) {
        valueElement.textContent = range.value;
    }

    moodRating.addEventListener('input', () => updateRangeValue(moodRating, moodValue));
    energyLevel.addEventListener('input', () => updateRangeValue(energyLevel, energyValue));

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
        })
        .catch(error => console.error('Error logging mood:', error));
    });

    function loadRecentMoods() {
        fetch('/api/moods')
        .then(response => response.json())
        .then(moods => {
            moodList.innerHTML = '';
            moods.forEach(mood => {
                const moodElement = createMoodElement(mood);
                moodList.appendChild(moodElement);
            });
        })
        .catch(error => console.error('Error loading moods:', error));
    }

    function createMoodElement(mood) {
        const moodElement = document.createElement('div');
        moodElement.className = 'bg-gray-100 dark:bg-gray-700 p-4 rounded-lg';
        moodElement.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <p class="font-semibold text-gray-800 dark:text-gray-200">Mood: ${mood.mood}/10</p>
                <p class="text-gray-600 dark:text-gray-400">Energy: ${mood.energy_level}/10</p>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">${new Date(mood.created_at).toLocaleString()}</p>
            <p class="mt-2 text-gray-700 dark:text-gray-300">${mood.notes || 'No notes'}</p>
            <div class="mt-2 flex space-x-2">
                <div class="w-1/2 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div class="bg-yellow-500 h-2.5 rounded-full" style="width: ${mood.mood * 10}%"></div>
                </div>
                <div class="w-1/2 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div class="bg-green-500 h-2.5 rounded-full" style="width: ${mood.energy_level * 10}%"></div>
                </div>
            </div>
        `;
        return moodElement;
    }

    loadRecentMoods();
});
