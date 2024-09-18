document.addEventListener('DOMContentLoaded', function() {
    console.log('ADHD Focus App loaded');

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    });

    // Check for saved theme preference
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        body.classList.add('dark-mode');
    }

    // Add yellow highlight to current page in navigation
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('text-yellow-500');
        }
    });
});

// Function to update progress bars
function updateProgressBar(elementId, progress) {
    const progressBar = document.getElementById(elementId);
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

// Add more custom JavaScript as needed
