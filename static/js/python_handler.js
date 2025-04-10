// Gestionnaire des fichiers Python
class PythonFileHandler {
    constructor() {
        this.currentFilePath = null;
        this.currentContent = null;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Écouter les clics sur les fichiers .py dans l'arborescence
        document.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem && fileItem.dataset.path && fileItem.dataset.path.endsWith('.py')) {
                this.loadPythonFile(fileItem.dataset.path);
=======
=======
>>>>>>> Stashed changes
        this.lastSavedContent = null;
        this.autoSaveTimeout = null;
        this.debug = true;
        this.currentProjectPath = '';
        this.parsedContent = null;
        this.initializeEventListeners();
    }

    log(message, data = null) {
        if (this.debug) {
            console.log(`[PythonHandler] ${message}`);
            if (data) {
                console.log(data);
            }
        }
    }

    initializeEventListeners() {
        this.log('Initializing event listeners');
        
        // Écouter les clics sur les fichiers .py dans l'arborescence
        document.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file');
            if (fileItem && fileItem.dataset.path && fileItem.dataset.path.endsWith('.py')) {
                const filePath = fileItem.dataset.path;
                this.log('Python file clicked:', filePath);
                
                // Obtenir le chemin complet du projet depuis l'élément parent
                const projectRoot = fileItem.closest('.project-root');
                if (projectRoot && projectRoot.dataset.path) {
                    this.currentProjectPath = projectRoot.dataset.path;
                    this.log('Project path found:', this.currentProjectPath);
                } else {
                    // Si pas de project-root, utiliser le chemin courant
                    this.currentProjectPath = window.location.pathname.endsWith('/') ? 
                        window.location.pathname.slice(0, -1) : 
                        window.location.pathname;
                    this.log('Using current path as project path:', this.currentProjectPath);
                }
                
                this.loadPythonFile(filePath);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            }
        });

        // Écouter les changements de vue (Manual/Script)
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                if (this.currentContent) {
                    const viewType = e.target.getAttribute('data-view');
=======
                const viewType = e.target.getAttribute('data-view');
                this.log('View tab clicked:', viewType);
                if (this.currentContent) {
>>>>>>> Stashed changes
=======
                const viewType = e.target.getAttribute('data-view');
                this.log('View tab clicked:', viewType);
                if (this.currentContent) {
>>>>>>> Stashed changes
                    this.switchView(viewType);
                }
            });
        });

<<<<<<< Updated upstream
<<<<<<< Updated upstream
        // Gestionnaire de sauvegarde
        document.addEventListener('click', (e) => {
            if (e.target.matches('.save-btn')) {
                this.saveCurrentFile();
            }
        });
    }

    async loadPythonFile(filePath) {
        try {
            const response = await fetch('/read_py_file', {
=======
=======
>>>>>>> Stashed changes
        // Écouter les changements dans l'éditeur Monaco
        document.addEventListener('monacoContentChanged', (e) => {
            this.log('Monaco content changed');
            this.currentContent = e.detail.content;
            this.handleContentChange('script');
        });

        // Gestionnaire de sauvegarde
        document.addEventListener('click', (e) => {
            if (e.target.matches('.save-btn')) {
                this.log('Save button clicked');
                this.saveCurrentFile();
            }
        });

        // Écouter les changements dans le tableau
        document.addEventListener('input', (e) => {
            if (e.target.closest('.test-steps')) {
                this.log('Manual table changed');
                this.handleContentChange('manual');
            }
        });
    }

    async loadPythonFile(filePath) {
        this.log('Loading Python file:', filePath);
        this.log('Project path:', this.currentProjectPath);
        
        try {
            const response = await fetch('/open_file', {
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                body: JSON.stringify({ path: filePath })
            });
            const data = await response.json();
            
            if (data.success) {
                this.currentFilePath = filePath;
                this.currentContent = data.content;
=======
=======
>>>>>>> Stashed changes
                body: JSON.stringify({ 
                    path: filePath.replace(/\\/g, '/'),  // Normaliser les backslashes en slashes
                    project_path: this.currentProjectPath.replace(/\\/g, '/')  // Normaliser les backslashes en slashes
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.log('Response data:', data);
            
            if (data.success) {
                this.log('File loaded successfully');
                this.currentFilePath = filePath;
                this.currentContent = data.content;
                this.lastSavedContent = data.content;
                this.parsedContent = data.parsed_content || [];
                this.log('Parsed content:', this.parsedContent);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                this.displayContent();
            } else {
                console.error('Error loading file:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    displayContent() {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
        this.log('Displaying content');
>>>>>>> Stashed changes
=======
        this.log('Displaying content');
>>>>>>> Stashed changes
        const activeTab = document.querySelector('.view-tab.active');
        const viewType = activeTab ? activeTab.getAttribute('data-view') : 'manual';
        this.switchView(viewType);
    }

    switchView(viewType) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
        this.log('Switching view to:', viewType);
>>>>>>> Stashed changes
=======
        this.log('Switching view to:', viewType);
>>>>>>> Stashed changes
        if (viewType === 'script') {
            this.displayScriptView();
        } else {
            this.displayManualView();
        }
    }

    displayScriptView() {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        const contentArea = document.querySelector('.test-content');
        contentArea.innerHTML = `
            <div class="script-editor">
                <textarea id="scriptContent" style="width: 100%; height: 500px; font-family: monospace;">${this.currentContent}</textarea>
            </div>
        `;
    }

    displayManualView() {
        const contentArea = document.querySelector('.test-content');
        const steps = this.parseScriptToSteps(this.currentContent);
=======
=======
>>>>>>> Stashed changes
        this.log('Displaying script view');
        const contentArea = document.querySelector('.test-content');
        
        // Créer un conteneur pour Monaco
        contentArea.innerHTML = '<div id="monaco-editor-container"></div>';
        
        // Initialiser l'éditeur Monaco avec le contenu actuel
        if (window.monacoHandler) {
            this.log('Setting Monaco content');
            window.monacoHandler.setContent(this.currentContent);
        } else {
            this.log('Monaco handler not found');
        }
    }

    displayManualView() {
        this.log('Displaying manual view');
        const contentArea = document.querySelector('.test-content');
        
        // Utiliser les étapes parsées si disponibles
        const steps = this.parsedContent || [];
        this.log('Steps to display:', steps);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        
        let tableHTML = `
            <table class="test-steps">
                <thead>
                    <tr>
                        <th>Step</th>
                        <th>Action Item</th>
                        <th>Action</th>
                        <th>Input</th>
                        <th>Output</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
        `;

        steps.forEach((step, index) => {
            tableHTML += `
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                <tr>
                    <td>${index + 1} - ${step.action}</td>
                    <td>${step.object || ''}</td>
                    <td>${step.action || ''}</td>
                    <td>${step.input || ''}</td>
                    <td></td>
                    <td>${step.description || ''}</td>
=======
=======
>>>>>>> Stashed changes
                <tr data-step="${index}">
                    <td>${index + 1}</td>
                    <td contenteditable="true">${step.actionItem || ''}</td>
                    <td contenteditable="true">${step.action || ''}</td>
                    <td contenteditable="true">${step.input || ''}</td>
                    <td contenteditable="true">${step.output || ''}</td>
                    <td contenteditable="true">${step.description || ''}</td>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                </tr>
            `;
        });

<<<<<<< Updated upstream
<<<<<<< Updated upstream
        tableHTML += `
                </tbody>
            </table>
        `;

        contentArea.innerHTML = tableHTML;
    }

    parseScriptToSteps(script) {
        const steps = [];
        const lines = script.split('\n');
        
        lines.forEach(line => {
            // Ignorer les imports et les lignes vides
            if (line.trim().startsWith('from') || line.trim().startsWith('import') || !line.trim()) {
                return;
            }

            // Détecter les appels de fonction
            if (line.includes('WebUI.')) {
                const match = line.match(/WebUI\.(\w+)\((.*)\)/);
                if (match) {
                    steps.push({
                        action: match[1],
                        object: 'WebUI',
                        input: match[2].replace(/['"]/g, ''),
                        description: `Execute ${match[1]} action`
                    });
                }
            }
            // Détecter les fonctions définies
            else if (line.trim().startsWith('def')) {
                const funcName = line.match(/def\s+(\w+)/)[1];
                steps.push({
                    action: 'Function',
                    object: 'Script',
                    input: funcName,
                    description: `Define function ${funcName}`
                });
            }
            // Détecter les prints
            else if (line.includes('print(')) {
                const message = line.match(/print\((.*)\)/)[1];
                steps.push({
                    action: 'Print',
                    object: 'Console',
                    input: message.replace(/['"]/g, ''),
                    description: 'Print message'
                });
            }
        });

        return steps;
    }

    async saveCurrentFile() {
        if (!this.currentFilePath) return;

        let content;
        const activeTab = document.querySelector('.view-tab.active');
        const viewType = activeTab ? activeTab.getAttribute('data-view') : 'manual';

        if (viewType === 'script') {
            content = document.querySelector('#scriptContent').value;
        } else {
            // TODO: Implémenter la conversion du tableau en script Python
=======
=======
>>>>>>> Stashed changes
        // Si aucune étape n'est présente, ajouter une ligne vide
        if (steps.length === 0) {
            tableHTML += `
                <tr data-step="0">
                    <td>1</td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                </tr>
            `;
        }

        // Ajouter un bouton pour ajouter une nouvelle ligne
        tableHTML += `</tbody></table>
        <button class="add-step-btn">Add Step</button>`;
        
        contentArea.innerHTML = tableHTML;

        // Ajouter les écouteurs pour la sauvegarde automatique
        const tableCells = contentArea.querySelectorAll('td[contenteditable="true"]');
        tableCells.forEach(cell => {
            cell.addEventListener('input', () => {
                this.log('Table cell changed');
                this.handleContentChange('manual');
            });
        });

        // Ajouter l'écouteur pour le bouton d'ajout de ligne
        const addButton = contentArea.querySelector('.add-step-btn');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.log('Add step button clicked');
                this.addNewStep();
            });
        }
    }

    addNewStep() {
        const tbody = document.querySelector('.test-steps tbody');
        if (!tbody) return;

        const newIndex = tbody.children.length;
        const newRow = document.createElement('tr');
        newRow.dataset.step = newIndex;
        
        newRow.innerHTML = `
            <td>${newIndex + 1}</td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
        `;

        tbody.appendChild(newRow);
        
        // Ajouter les écouteurs à la nouvelle ligne
        const cells = newRow.querySelectorAll('td[contenteditable="true"]');
        cells.forEach(cell => {
            cell.addEventListener('input', () => {
                this.log('New row cell changed');
                this.handleContentChange('manual');
            });
        });
    }

    handleContentChange(viewType) {
        this.log('Content changed in view:', viewType);
        
        // Annuler le timeout précédent
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Définir un nouveau timeout pour la sauvegarde automatique
        this.autoSaveTimeout = setTimeout(() => {
            this.saveCurrentFile(viewType);
        }, 1000);
    }

    async saveCurrentFile(viewType) {
        if (!this.currentFilePath) {
            this.log('No current file to save');
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            return;
        }

        try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
            let content;
            if (viewType === 'script') {
                this.log('Getting content from Monaco for save');
                content = window.monacoHandler ? window.monacoHandler.getCurrentContent() : this.currentContent;
            } else {
                this.log('Getting content from manual table for save');
                const steps = this.getStepsFromTable();
                this.log('Table steps:', steps);
                content = window.pythonConverter.manualToScript(steps);
            }

            // Vérifier si le contenu a changé
            if (content === this.lastSavedContent) {
                this.log('Content unchanged, skipping save');
                return;
            }

            this.log('Saving file:', this.currentFilePath);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            const response = await fetch('/save_py_file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                    path: this.currentFilePath,
                    content: content
                })
            });
            
            const data = await response.json();
            if (data.success) {
                console.log('File saved successfully');
=======
=======
>>>>>>> Stashed changes
                    path: this.currentFilePath.replace(/\\/g, '/'),  // Normaliser les backslashes en slashes
                    content: content
                })
            });

            const data = await response.json();
            if (data.success) {
                this.log('File saved successfully');
                this.currentContent = content;
                this.lastSavedContent = content;
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            } else {
                console.error('Error saving file:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes

    getStepsFromTable() {
        this.log('Getting steps from table');
        const steps = [];
        const rows = document.querySelectorAll('.test-steps tbody tr');
        
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 6) {
                const step = {
                    actionItem: cells[1].textContent,
                    action: cells[2].textContent,
                    input: cells[3].textContent,
                    output: cells[4].textContent,
                    description: cells[5].textContent
                };
                this.log(`Step ${index + 1}:`, step);
                steps.push(step);
            }
        });
        
        return steps;
    }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}

// Initialiser le gestionnaire de fichiers Python
document.addEventListener('DOMContentLoaded', () => {
    window.pythonHandler = new PythonFileHandler();
});
