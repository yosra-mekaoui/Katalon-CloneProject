// Monaco Editor Handler
class MonacoEditorHandler {
    constructor() {
        this.editor = null;
        this.pythonDiagnostics = null;
<<<<<<< Updated upstream
=======
        this.currentContent = '';
>>>>>>> Stashed changes
        this.initializeEditor();
    }

    initializeEditor() {
        require(['vs/editor/editor.main'], () => {
            // Register Python language
            monaco.languages.register({ id: 'python' });

            // Create editor when switching to script view
            document.addEventListener('viewChanged', (event) => {
                if (event.detail.view === 'script') {
                    this.createEditor();
                }
            });
        });
    }

    createEditor() {
        const scriptContent = document.querySelector('#scriptContent');
        if (!scriptContent) return;

        const container = document.createElement('div');
        container.id = 'monaco-editor-container';
        container.style.width = '100%';
        container.style.height = '500px';
        scriptContent.parentNode.replaceChild(container, scriptContent);

<<<<<<< Updated upstream
        this.editor = monaco.editor.create(container, {
            value: scriptContent.value || '',
=======
        // Préserver le contenu initial
        this.currentContent = scriptContent.value || '';

        this.editor = monaco.editor.create(container, {
            value: this.currentContent,
>>>>>>> Stashed changes
            language: 'python',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: {
                enabled: true
            },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            tabSize: 4,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true
        });

        // Set up Python syntax validation
        this.setupPythonValidation();

<<<<<<< Updated upstream
        // Handle content changes
        this.editor.onDidChangeModelContent(() => {
            this.validatePythonSyntax();
            this.updateContent();
        });
    }

    setupPythonValidation() {
        this.pythonDiagnostics = monaco.languages.registerDiagnosticsProvider('python', {
            getId: () => 'python',
            dispose: () => {},
            onDidChange: () => {},
            provideDiagnostics: (model) => {
                const content = model.getValue();
                const diagnostics = this.validatePythonContent(content);
                return {
                    diagnostics: diagnostics,
                    uri: model.uri
                };
            }
        });
    }

    validatePythonContent(content) {
        const diagnostics = [];
        try {
            // Basic Python syntax validation
            new Function('import', 'from', content);
        } catch (e) {
            const match = e.message.match(/at line (\d+)/);
            if (match) {
                const lineNumber = parseInt(match[1]) - 1;
                diagnostics.push({
                    severity: monaco.MarkerSeverity.Error,
                    startLineNumber: lineNumber,
                    startColumn: 1,
                    endLineNumber: lineNumber,
                    endColumn: 1000,
                    message: e.message
                });
            }
        }
        return diagnostics;
    }

    updateContent() {
        if (!this.editor) return;
        const content = this.editor.getValue();
        // Update the hidden textarea for form submission
        let scriptContent = document.querySelector('#scriptContent');
        if (!scriptContent) {
            scriptContent = document.createElement('textarea');
            scriptContent.id = 'scriptContent';
            scriptContent.style.display = 'none';
            this.editor.getContainerDomNode().parentNode.appendChild(scriptContent);
        }
        scriptContent.value = content;

        // Trigger content update event
        const event = new CustomEvent('scriptContentChanged', {
            detail: { content: content }
        });
        document.dispatchEvent(event);
    }

    getContent() {
        return this.editor ? this.editor.getValue() : '';
    }

    setContent(content) {
=======
        // Listen for content changes
        this.editor.onDidChangeModelContent(() => {
            this.currentContent = this.editor.getValue();
            this.updateContent();

            // Émettre un événement de changement pour la synchronisation
            const event = new CustomEvent('scriptContentChanged', {
                detail: { content: this.currentContent }
            });
            document.dispatchEvent(event);
        });
    }

    getCurrentContent() {
        return this.currentContent;
    }

    setContent(content) {
        this.currentContent = content;
>>>>>>> Stashed changes
        if (this.editor) {
            this.editor.setValue(content);
        }
    }

<<<<<<< Updated upstream
    dispose() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
        if (this.pythonDiagnostics) {
            this.pythonDiagnostics.dispose();
            this.pythonDiagnostics = null;
        }
=======
    setupPythonValidation() {
        if (!this.editor) return;

        const model = this.editor.getModel();
        if (!model) return;

        model.onDidChangeContent(() => {
            const content = model.getValue();
            const diagnostics = this.validatePythonContent(content);
            monaco.editor.setModelMarkers(model, "python", diagnostics);
        });
    }

    validatePythonContent(content) {
        const errors = [];
        const lines = content.split("\n");
        
        // Validation basique de la syntaxe Python
        lines.forEach((line, index) => {
            // Vérifier les parenthèses non fermées
            const openParens = (line.match(/\(/g) || []).length;
            const closeParens = (line.match(/\)/g) || []).length;
            if (openParens !== closeParens) {
                errors.push({
                    severity: monaco.MarkerSeverity.Error,
                    message: "Parenthèses non équilibrées",
                    startLineNumber: index + 1,
                    endLineNumber: index + 1,
                    startColumn: 1,
                    endColumn: line.length + 1
                });
            }

            // Vérifier l'indentation
            if (line.length > 0 && !line.startsWith(' ' * 4) && !line.startsWith('\t')) {
                const leadingSpaces = line.match(/^[ ]*/)[0].length;
                if (leadingSpaces % 4 !== 0) {
                    errors.push({
                        severity: monaco.MarkerSeverity.Warning,
                        message: "L'indentation devrait être un multiple de 4 espaces",
                        startLineNumber: index + 1,
                        endLineNumber: index + 1,
                        startColumn: 1,
                        endColumn: leadingSpaces + 1
                    });
                }
            }
        });

        return errors;
    }

    updateContent() {
        // Sauvegarder le contenu actuel
        this.currentContent = this.editor.getValue();
        
        // Émettre un événement pour la synchronisation
        const event = new CustomEvent('monacoContentChanged', {
            detail: {
                content: this.currentContent,
                isValid: this.editor.getModel().getValidation().length === 0
            }
        });
        document.dispatchEvent(event);
>>>>>>> Stashed changes
    }
}

// Initialize Monaco Editor Handler
document.addEventListener('DOMContentLoaded', () => {
    window.monacoHandler = new MonacoEditorHandler();
});
