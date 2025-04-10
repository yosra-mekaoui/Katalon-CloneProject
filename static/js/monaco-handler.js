// Monaco Editor Handler
class MonacoEditorHandler {
    constructor() {
        this.editor = null;
        this.pythonDiagnostics = null;
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

        this.editor = monaco.editor.create(container, {
            value: scriptContent.value || '',
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
        if (this.editor) {
            this.editor.setValue(content);
        }
    }

    dispose() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
        if (this.pythonDiagnostics) {
            this.pythonDiagnostics.dispose();
            this.pythonDiagnostics = null;
        }
    }
}

// Initialize Monaco Editor Handler
document.addEventListener('DOMContentLoaded', () => {
    window.monacoHandler = new MonacoEditorHandler();
});
