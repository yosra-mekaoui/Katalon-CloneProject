// Gestionnaire de thèmes
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeMenuItems = document.querySelectorAll('.theme-submenu .submenu li');
    
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Gestionnaire pour le bouton moon dans la barre d'outils
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'default' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Gestionnaire pour les options du menu Tools
    themeMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const selectedTheme = this.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', selectedTheme);
            localStorage.setItem('theme', selectedTheme);
            updateThemeIcon(selectedTheme);
        });
    });

    // Mettre à jour l'icône du bouton moon
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme.includes('dark')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
});
