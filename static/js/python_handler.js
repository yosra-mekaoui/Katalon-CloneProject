// Gestionnaire des fichiers Python
class PythonFileHandler {
    constructor() {
        this.currentFilePath = null;
        this.currentContent = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Écouter les clics sur les fichiers .py dans l'arborescence
        document.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem && fileItem.dataset.path && fileItem.dataset.path.endsWith('.py')) {
                this.loadPythonFile(fileItem.dataset.path);
            }
        });

        // Écouter les changements de vue (Manual/Script)
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (this.currentContent) {
                    const viewType = e.target.getAttribute('data-view');
                    this.switchView(viewType);
                }
            });
        });

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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: filePath })
            });
            const data = await response.json();
            
            if (data.success) {
                this.currentFilePath = filePath;
                this.currentContent = data.content;
                this.displayContent();
            } else {
                console.error('Error loading file:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    displayContent() {
        const activeTab = document.querySelector('.view-tab.active');
        const viewType = activeTab ? activeTab.getAttribute('data-view') : 'manual';
        this.switchView(viewType);
    }

    switchView(viewType) {
        if (viewType === 'script') {
            this.displayScriptView();
        } else {
            this.displayManualView();
        }
    }

    displayScriptView() {
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
                <tr>
                    <td>${index + 1} - ${step.action}</td>
                    <td>${step.object || ''}</td>
                    <td>${step.action || ''}</td>
                    <td>${step.input || ''}</td>
                    <td></td>
                    <td>${step.description || ''}</td>
                </tr>
            `;
        });

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
            return;
        }

        try {
            const response = await fetch('/save_py_file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: this.currentFilePath,
                    content: content
                })
            });
            
            const data = await response.json();
            if (data.success) {
                console.log('File saved successfully');
            } else {
                console.error('Error saving file:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Initialiser le gestionnaire de fichiers Python
document.addEventListener('DOMContentLoaded', () => {
    window.pythonHandler = new PythonFileHandler();
});
