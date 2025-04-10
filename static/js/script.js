document.addEventListener('DOMContentLoaded', function() {
    // Gestion des vues Manual/Script/Variables
    const viewTabs = document.querySelectorAll('.view-tab');
    const manualView = document.getElementById('manual-view');
    const scriptView = document.getElementById('script-view');
    const variablesView = document.getElementById('variables-view');
    const test89Script = document.getElementById('test89-script');
    const sampleScript = document.getElementById('sample-script');

    // Fonction pour changer de vue
    function switchView(view) {
        // Trouver et activer l'onglet correspondant
        const targetTab = Array.from(viewTabs).find(tab => tab.getAttribute('data-view') === view);
        if (!targetTab) return;

        // Activer l'onglet
        viewTabs.forEach(t => t.classList.remove('active'));
        targetTab.classList.add('active');

        // Cacher toutes les vues
        manualView.style.display = 'none';
        scriptView.style.display = 'none';
        variablesView.style.display = 'none';

        // Afficher la vue sélectionnée
        switch(view) {
            case 'manual':
                manualView.style.display = '';
                break;
            case 'script':
                scriptView.style.display = '';
                break;
            case 'variables':
                variablesView.style.display = '';
                break;
        }
    }

    // Gestionnaire de clic sur les onglets
    viewTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });

    // Gestion des dossiers dans la sidebar
    const folders = document.querySelectorAll('.folder');
    folders.forEach(folder => {
        // Ajouter l'icône chevron
        const chevron = document.createElement('i');
        chevron.className = 'fas fa-chevron-right';
        chevron.style.marginRight = '4px';
        folder.insertBefore(chevron, folder.firstChild);

        // Si le dossier est marqué comme ouvert, l'ouvrir
        if (folder.classList.contains('open')) {
            const ul = folder.nextElementSibling;
            if (ul) {
                ul.style.display = 'block';
            }
        }

        folder.addEventListener('click', function(e) {
            const ul = this.nextElementSibling;
            if (ul) {
                this.classList.toggle('open');
                if (this.classList.contains('open')) {
                    ul.style.display = 'block';
                } else {
                    ul.style.display = 'none';
                }
            }
            folders.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            e.stopPropagation();
        });
    });

    // Gestion de la sélection des fichiers
    const files = document.querySelectorAll('.file');
    files.forEach(file => {
        file.addEventListener('click', function(e) {
            files.forEach(f => f.classList.remove('active'));
            this.classList.add('active');

            // Mettre à jour le titre de l'onglet du projet
            const projectName = this.textContent.trim();
            const projectTab = document.querySelector('.project-name');
            if (projectTab) {
                projectTab.textContent = projectName;
            }

            // Mettre à jour le titre de la fenêtre
            document.title = projectName + ' - Katalon Clone';

            // Afficher les steps correspondants
            const testSteps = document.querySelectorAll('.test-steps');
            testSteps.forEach(steps => {
                steps.style.display = 'none';
                steps.classList.remove('active');
            });

            // Cacher tous les scripts
            test89Script.style.display = 'none';
            sampleScript.style.display = 'none';

            if (projectName === 'Test89_ASP') {
                const test89Steps = document.getElementById('test89-steps');
                if (test89Steps) {
                    test89Steps.style.display = '';
                    test89Steps.classList.add('active');
                }
                test89Script.style.display = '';
            } else if (projectName === 'Sample Test Case') {
                const sampleSteps = document.getElementById('sample-steps');
                if (sampleSteps) {
                    sampleSteps.style.display = '';
                    sampleSteps.classList.add('active');
                }
                sampleScript.style.display = '';
            }

            e.stopPropagation();
        });
    });

    // Gestion de la recherche
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const treeItems = document.querySelectorAll('.tree-view .folder, .tree-view .file');
        
        treeItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const parent = item.closest('li');
            
            if (text.includes(searchTerm)) {
                parent.style.display = 'block';
                // Si c'est un fichier, montrer aussi son dossier parent
                if (item.classList.contains('file')) {
                    const parentFolder = item.closest('ul').previousElementSibling;
                    if (parentFolder) {
                        parentFolder.classList.add('open');
                        parentFolder.nextElementSibling.style.display = 'block';
                    }
                }
            } else {
                if (item.classList.contains('file')) {
                    parent.style.display = 'none';
                }
            }
        });
    }

    searchInput.addEventListener('input', performSearch);
    searchButton.addEventListener('click', performSearch);

    // Gestion des lignes de table
    const tableRows = document.querySelectorAll('table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const activeSteps = document.querySelector('.test-steps.active');
            if (activeSteps) {
                activeSteps.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            }
            this.classList.add('selected');
        });

        // Double-clic pour éditer
        row.addEventListener('dblclick', function(e) {
            if (e.target.tagName === 'TD') {
                e.target.contentEditable = true;
                e.target.focus();
            }
        });
    });

    // Boutons de la barre d'outils
    const addButton = document.querySelector('.editor-toolbar button[title="Add"]');
    if (addButton) {
        addButton.addEventListener('click', function() {
            const tbody = document.querySelector('table tbody');
            const newRow = document.createElement('tr');
            const rowCount = tbody.children.length;
            
            newRow.innerHTML = `
                <td>${rowCount + 1} - New Step</td>
                <td>Object</td>
                <td>Input</td>
                <td>Output</td>
                <td>Description</td>
            `;
            
            tbody.appendChild(newRow);
            setupRowEvents(newRow);
        });
    }

    // Bouton de suppression
    const deleteButton = document.querySelector('.editor-toolbar button[title="Delete"]');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            const selectedRow = document.querySelector('tr.selected');
            if (selectedRow) {
                selectedRow.remove();
                updateStepNumbers();
            }
        });
    }

    // Boutons de déplacement
    const moveUpButton = document.querySelector('.editor-toolbar button[title="Move Up"]');
    const moveDownButton = document.querySelector('.editor-toolbar button[title="Move Down"]');

    if (moveUpButton) {
        moveUpButton.addEventListener('click', function() {
            const selectedRow = document.querySelector('tr.selected');
            if (selectedRow && selectedRow.previousElementSibling) {
                selectedRow.parentNode.insertBefore(selectedRow, selectedRow.previousElementSibling);
                updateStepNumbers();
            }
        });
    }

    if (moveDownButton) {
        moveDownButton.addEventListener('click', function() {
            const selectedRow = document.querySelector('tr.selected');
            if (selectedRow && selectedRow.nextElementSibling) {
                selectedRow.parentNode.insertBefore(selectedRow.nextElementSibling, selectedRow);
                updateStepNumbers();
            }
        });
    }

    // Gestion des onglets du bas
    const tabButtons = document.querySelectorAll('.tab-buttons button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Gestion de l'onglet du projet
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Do you want to close the project?')) {
                const tab = this.closest('.tab');
                tab.remove();
            }
        });
    }

    const projectTab = document.querySelector('.tab');
    if (projectTab) {
        projectTab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    }

    // Gestion du menu File et Open Project
    const fileMenu = document.getElementById('file-menu');
    const openProjectBtn = document.getElementById('open-project');

    fileMenu.addEventListener('click', function(e) {
        const dropdownMenu = this.querySelector('.dropdown-menu');
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        e.stopPropagation();
    });

    // Fermer le menu quand on clique ailleurs
    document.addEventListener('click', function() {
        const dropdownMenus = document.querySelectorAll('.dropdown-menu');
        dropdownMenus.forEach(menu => menu.style.display = 'none');
    });

    // Gérer l'ouverture de projet
    openProjectBtn.addEventListener('click', async function() {
        // Créer un input file invisible
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.directory = true;

        input.addEventListener('change', async function() {
            if (this.files.length > 0) {
                const projectPath = this.files[0].path.split('\\').slice(0, -1).join('\\');
                
                try {
                    const response = await fetch('/open_project', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ path: projectPath })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        // Mettre à jour l'arborescence du projet
                        updateProjectTree(data.project);
                    } else {
                        alert(data.message || 'Failed to open project');
                    }
                } catch (error) {
                    console.error('Error opening project:', error);
                    alert('Error opening project');
                }
            }
        });

        input.click();
    });

    // Fonction pour mettre à jour l'arborescence du projet
    function updateProjectTree(project) {
        const sidebar = document.querySelector('.sidebar');
        sidebar.innerHTML = ''; // Nettoyer la sidebar

        function createTreeNode(item) {
            const div = document.createElement('div');
            div.className = item.type === 'folder' ? 'folder' : 'file';
            
            // Ajouter l'icône appropriée
            const icon = document.createElement('i');
            if (item.type === 'folder') {
                icon.className = 'fas fa-folder';
                if (KATALON_FOLDERS.includes(item.name)) {
                    // Icônes spécifiques pour les dossiers Katalon
                    switch(item.name) {
                        case 'Test Cases':
                            icon.className = 'fas fa-vial';
                            break;
                        case 'Object Repository':
                            icon.className = 'fas fa-cube';
                            break;
                        case 'Test Suites':
                            icon.className = 'fas fa-layer-group';
                            break;
                        case 'Reports':
                            icon.className = 'fas fa-chart-bar';
                            break;
                        case 'Data Files':
                            icon.className = 'fas fa-database';
                            break;
                        default:
                            icon.className = 'fas fa-folder';
                    }
                }
            } else {
                icon.className = 'fas fa-file';
                // Icônes spécifiques selon l'extension
                if (item.name.endsWith('.groovy')) {
                    icon.className = 'fas fa-code';
                } else if (item.name.endsWith('.json')) {
                    icon.className = 'fas fa-file-code';
                } else if (item.name.endsWith('.xlsx') || item.name.endsWith('.xls')) {
                    icon.className = 'fas fa-file-excel';
                }
            }
            div.appendChild(icon);

            const span = document.createElement('span');
            span.textContent = ' ' + item.name;
            div.appendChild(span);

            if (item.type === 'folder' && item.children) {
                const childContainer = document.createElement('div');
                childContainer.className = 'folder-content';
                childContainer.style.display = 'none';
                
                item.children.forEach(child => {
                    childContainer.appendChild(createTreeNode(child));
                });

                div.addEventListener('click', function(e) {
                    this.classList.toggle('open');
                    childContainer.style.display = childContainer.style.display === 'none' ? 'block' : 'none';
                    e.stopPropagation();
                });

                const container = document.createElement('div');
                container.appendChild(div);
                container.appendChild(childContainer);
                return container;
            }

            return div;
        }

        sidebar.appendChild(createTreeNode(project));
    }

    // Fonctions utilitaires
    function setupRowEvents(row) {
        row.addEventListener('click', function() {
            document.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');
        });

        row.addEventListener('dblclick', function(e) {
            if (e.target.tagName === 'TD') {
                e.target.contentEditable = true;
                e.target.focus();
            }
        });
    }

    function updateStepNumbers() {
        const rows = document.querySelectorAll('table tbody tr');
        rows.forEach((row, index) => {
            const firstCell = row.cells[0];
            const currentText = firstCell.textContent;
            const stepName = currentText.substring(currentText.indexOf('-'));
            firstCell.textContent = `${index + 1}${stepName}`;
        });
    }
});
