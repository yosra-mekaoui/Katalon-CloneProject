document.addEventListener('DOMContentLoaded', function() {
    // Gestion des thèmes
    initializeThemes();
    
    const testSteps = [];
    
    // Button handlers
    document.getElementById('newTest').addEventListener('click', createNewTest);
    document.getElementById('runTest').addEventListener('click', runTest);
    document.getElementById('saveTest').addEventListener('click', saveTest);

    function createNewTest() {
        const step = {
            action: 'Click',
            target: '',
            value: ''
        };
        addStepToTable(step);
    }

    function addStepToTable(step) {
        const tbody = document.getElementById('stepTableBody');
        const row = document.createElement('tr');
        
        // Action cell with dropdown
        const actionCell = document.createElement('td');
        const actionSelect = document.createElement('select');
        ['Click', 'Type', 'Select', 'Wait', 'Verify'].forEach(action => {
            const option = document.createElement('option');
            option.value = action;
            option.textContent = action;
            if (action === step.action) option.selected = true;
            actionSelect.appendChild(option);
        });
        actionCell.appendChild(actionSelect);

        // Target cell
        const targetCell = document.createElement('td');
        const targetInput = document.createElement('input');
        targetInput.type = 'text';
        targetInput.value = step.target;
        targetInput.placeholder = 'Enter selector';
        targetCell.appendChild(targetInput);

        // Value cell
        const valueCell = document.createElement('td');
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.value = step.value;
        valueInput.placeholder = 'Enter value';
        valueCell.appendChild(valueInput);

        // Actions cell
        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => row.remove();
        actionsCell.appendChild(deleteBtn);

        // Add all cells to row
        row.appendChild(actionCell);
        row.appendChild(targetCell);
        row.appendChild(valueCell);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    }

    function saveTest() {
        const steps = [];
        const rows = document.getElementById('stepTableBody').getElementsByTagName('tr');
        
        for (let row of rows) {
            const cells = row.getElementsByTagName('td');
            steps.push({
                action: cells[0].querySelector('select').value,
                target: cells[1].querySelector('input').value,
                value: cells[2].querySelector('input').value
            });
        }

        fetch('/create_test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ steps: steps })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Test case saved successfully!');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function runTest() {
        const steps = [];
        const rows = document.getElementById('stepTableBody').getElementsByTagName('tr');
        
        for (let row of rows) {
            const cells = row.getElementsByTagName('td');
            steps.push({
                action: cells[0].querySelector('select').value,
                target: cells[1].querySelector('input').value,
                value: cells[2].querySelector('input').value
            });
        }

        fetch('/run_test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ steps: steps })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Test executed successfully!');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // Add sample test case
    addStepToTable({
        action: 'Click',
        target: '#login-button',
        value: ''
    });
     // Redimensionnement de la sidebar
    const resizer = document.querySelector(".resizer");
    const sidebar = document.querySelector(".sidebar");
    const sidebarTitle = document.querySelector(".sidebar-title");

    sidebarTitle.addEventListener("click", function() {
        sidebar.classList.toggle("collapsed");
    });
    let isResizing = false;

    resizer.addEventListener("mousedown", function(e) {
        isResizing = true;
        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
    });

    function resize(e) {
        if (isResizing) {
            let newWidth = e.clientX;
            if (newWidth < 150) newWidth = 150; // Largeur minimale
            if (newWidth > 500) newWidth = 500; // Largeur maximale
            sidebar.style.width = newWidth + "px";
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
    }
});

// Fonction d'initialisation des thèmes
function initializeThemes() {
    // Initialiser le thème par défaut
    const currentTheme = localStorage.getItem('theme') || 'light';
    const currentColor = localStorage.getItem('themeColor') || 'default';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-color', currentColor);

    // Gérer les clics sur les options de thème
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const theme = this.getAttribute('data-theme');
            const color = this.getAttribute('data-color');
            
            // Appliquer le thème
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.setAttribute('data-color', color);
            
            // Sauvegarder les préférences
            localStorage.setItem('theme', theme);
            localStorage.setItem('themeColor', color);
            
            // Mettre à jour l'icône du toggle theme dans la toolbar
            const themeToggle = document.querySelector('.theme-toggle i');
            if (themeToggle) {
                themeToggle.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    });

    // Gérer le clic sur le bouton de toggle dans la toolbar
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const currentColor = document.documentElement.getAttribute('data-color') || 'default';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Appliquer le thème
            document.documentElement.setAttribute('data-theme', newTheme);
            document.documentElement.setAttribute('data-color', currentColor);
            
            // Sauvegarder les préférences
            localStorage.setItem('theme', newTheme);
            
            // Mettre à jour l'icône
            const icon = this.querySelector('i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });
    }

    // Gérer l'ouverture/fermeture du menu Tools
    const toolsMenu = document.getElementById('toolsMenu');
    if (toolsMenu) {
        toolsMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = this.classList.contains('active');
            
            // Fermer tous les menus ouverts
            document.querySelectorAll('.main-menu > li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Ouvrir/fermer le menu Tools
            if (!isActive) {
                this.classList.add('active');
            }
        });
    }

    // Fermer les menus lors d'un clic à l'extérieur
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.main-menu')) {
            document.querySelectorAll('.main-menu > li').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}
