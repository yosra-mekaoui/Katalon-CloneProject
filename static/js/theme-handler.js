// Theme Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme from localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    const currentColor = localStorage.getItem('themeColor') || 'default';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-color', currentColor);

    // Handle theme option clicks
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const theme = this.getAttribute('data-theme');
            const color = this.getAttribute('data-color');
            
            // Apply theme
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.setAttribute('data-color', color);
            
            // Save preferences
            localStorage.setItem('theme', theme);
            localStorage.setItem('themeColor', color);
            
            // Update toggle button icon
            updateThemeIcon(theme === 'dark');
        });
    });

    // Handle quick toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const currentColor = document.documentElement.getAttribute('data-color');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Keep the current color scheme when toggling
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            updateThemeIcon(newTheme === 'dark');
        });
    }

    // Update theme toggle icon
    function updateThemeIcon(isDark) {
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            if (isDark) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    }

    // Initialize icon state
    updateThemeIcon(currentTheme === 'dark');
});
