document.addEventListener('DOMContentLoaded', function() {
    const moodForm = document.getElementById('mood-form');
    const moodList = document.getElementById('mood-list');

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
        moodElement.className = 'bg-gray-100 p-4 rounded-lg';
        moodElement.innerHTML = `
            <p class="font-semibold">Mood: ${mood.mood}/10</p>
            <p>Energy: ${mood.energy_level}/10</p>
            <p class="text-sm text-gray-600">${new Date(mood.created_at).toLocaleString()}</p>
            <p class="mt-2">${mood.notes || 'No notes'}</p>
        `;
        return moodElement;
    }

    loadRecentMoods();
});
