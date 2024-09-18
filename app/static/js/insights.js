document.addEventListener('DOMContentLoaded', function() {
    loadInsights();
});

function loadInsights() {
    fetch('/api/insights')
        .then(response => response.json())
        .then(insights => {
            const insightsContainer = document.getElementById('insights-container');
            insightsContainer.innerHTML = '';
            insights.forEach((insight, index) => {
                const insightElement = createInsightElement(insight, index);
                insightsContainer.appendChild(insightElement);
            });
        })
        .catch(error => {
            console.error('Error fetching insights:', error);
            showNotification('Error loading insights. Please try again later.', 'error');
        });
}

function createInsightElement(insight, index) {
    const insightElement = document.createElement('div');
    insightElement.className = 'insight-item card slide-in';
    insightElement.style.animationDelay = `${index * 0.1}s`;

    const icon = getInsightIcon(insight);
    const color = getInsightColor(insight);

    insightElement.innerHTML = `
        <div class="flex items-center mb-4">
            <span class="text-4xl mr-4 ${color}">${icon}</span>
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">${getInsightTitle(insight)}</h2>
        </div>
        <p class="text-gray-600 dark:text-gray-400">${insight}</p>
        <div class="mt-4 insight-actions">
            <button class="btn btn-sm btn-info mr-2" onclick="shareInsight(this)">
                <i class="fas fa-share-alt mr-1"></i> Share
            </button>
            <button class="btn btn-sm btn-success" onclick="applyInsight(this)">
                <i class="fas fa-check mr-1"></i> Apply
            </button>
        </div>
    `;

    return insightElement;
}

function getInsightIcon(insight) {
    if (insight.includes('mood')) return '😊';
    if (insight.includes('task') || insight.includes('productivity')) return '📊';
    if (insight.includes('habit')) return '🔁';
    if (insight.includes('focus')) return '🎯';
    return '💡';
}

function getInsightColor(insight) {
    if (insight.includes('mood')) return 'text-yellow-500';
    if (insight.includes('task') || insight.includes('productivity')) return 'text-blue-500';
    if (insight.includes('habit')) return 'text-green-500';
    if (insight.includes('focus')) return 'text-purple-500';
    return 'text-gray-500';
}

function getInsightTitle(insight) {
    if (insight.includes('mood')) return 'Mood Insight';
    if (insight.includes('task') || insight.includes('productivity')) return 'Productivity Insight';
    if (insight.includes('habit')) return 'Habit Insight';
    if (insight.includes('focus')) return 'Focus Insight';
    return 'General Insight';
}

function shareInsight(button) {
    const insightText = button.closest('.insight-item').querySelector('p').textContent;
    // Implement sharing functionality (e.g., copy to clipboard or open share dialog)
    navigator.clipboard.writeText(insightText)
        .then(() => showNotification('Insight copied to clipboard!', 'success'))
        .catch(err => showNotification('Failed to copy insight.', 'error'));
}

function applyInsight(button) {
    const insightText = button.closest('.insight-item').querySelector('p').textContent;
    // Implement apply functionality (e.g., create a task or set a reminder based on the insight)
    showNotification('Insight applied successfully!', 'success');
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
