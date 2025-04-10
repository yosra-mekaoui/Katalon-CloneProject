// Gestionnaire de conversion Python
class PythonConverter {
    constructor() {
        this.imports = new Set();
        this.configurations = [];
        this.debug = true;
    }

    log(message, data = null) {
        if (this.debug) {
            console.log(`[PythonConverter] ${message}`);
            if (data) {
                console.log(data);
            }
        }
    }

    scriptToManual(scriptContent) {
        this.log('Starting scriptToManual conversion');
        this.log('Original script content:', scriptContent);
        
        // Sauvegarder les imports et configurations
        this.extractImportsAndConfig(scriptContent);
        this.log('Extracted imports:', Array.from(this.imports));
        this.log('Extracted configurations:', this.configurations);
        
        const lines = scriptContent.split('\n');
        const steps = [];
        let currentStep = null;
        
        for (let line of lines) {
            line = line.trim();
            
            // Ignorer les lignes vides et les commentaires
            if (!line || line.startsWith('#')) {
                this.log('Skipping empty or comment line:', line);
                continue;
            }
            
            // Ignorer les lignes d'import et de configuration déjà sauvegardées
            if (this.isImportOrConfig(line)) {
                this.log('Skipping import/config line:', line);
                continue;
            }

            // Analyser la ligne pour extraire l'action
            const actionInfo = this.parseActionLine(line);
            if (actionInfo) {
                this.log('Parsed action:', actionInfo);
                steps.push(actionInfo);
            } else {
                this.log('Failed to parse line:', line);
            }
        }
        
        this.log('Final manual steps:', steps);
        return steps;
    }

    manualToScript(steps) {
        this.log('Starting manualToScript conversion');
        this.log('Input steps:', steps);
        
        let script = '';
        
        // Ajouter les imports sauvegardés
        this.imports.forEach(imp => {
            script += imp + '\n';
        });
        this.log('Added imports to script');
        
        // Ajouter une ligne vide après les imports
        if (this.imports.size > 0) {
            script += '\n';
        }
        
        // Ajouter les configurations sauvegardées
        this.configurations.forEach(config => {
            script += config + '\n';
        });
        this.log('Added configurations to script');
        
        // Ajouter une ligne vide après les configurations
        if (this.configurations.length > 0) {
            script += '\n';
        }

        // Convertir chaque étape en code Python
        steps.forEach((step, index) => {
            this.log(`Converting step ${index + 1}:`, step);
            
            if (step.action) {
                const pythonCode = this.convertStepToCode(step);
                if (pythonCode) {
                    script += pythonCode + '\n';
                    this.log('Generated Python code:', pythonCode);
                } else {
                    this.log('Failed to convert step to code:', step);
                }
            }
        });
        
        this.log('Final script:', script);
        return script;
    }

    extractImportsAndConfig(scriptContent) {
        this.log('Starting import/config extraction');
        
        const lines = scriptContent.split('\n');
        this.imports.clear();
        this.configurations = [];
        
        let isConfig = false;
        let configBlock = '';
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Capturer les imports
            if (trimmedLine.startsWith('import ') || trimmedLine.startsWith('from ')) {
                this.log('Found import:', line);
                this.imports.add(line);
                continue;
            }
            
            // Détecter le début de la configuration
            if (trimmedLine.includes('RunConfiguration') || 
                trimmedLine.includes('findTestObject') || 
                trimmedLine.includes('file_path') ||
                trimmedLine.includes('prope') ||
                trimmedLine.includes('driver =')) {
                this.log('Found start of config block:', line);
                isConfig = true;
                configBlock = line;
            }
            
            // Sauvegarder les lignes de configuration
            if (isConfig && trimmedLine) {
                this.configurations.push(line);
                
                // Détecter la fin de la configuration
                if (trimmedLine.endsWith(')') || trimmedLine.endsWith('"}') || trimmedLine.endsWith('"')) {
                    this.log('Found end of config block:', configBlock);
                    isConfig = false;
                    configBlock = '';
                }
            }
        }
    }

    isImportOrConfig(line) {
        const isImport = this.imports.has(line);
        const isConfig = this.configurations.includes(line);
        if (isImport || isConfig) {
            this.log('Line is import/config:', { line, isImport, isConfig });
        }
        return isImport || isConfig;
    }

    parseActionLine(line) {
        this.log('Parsing action line:', line);
        
        // Regex pour capturer les appels de fonction WebUI et autres commandes
        const webUIRegex = /WebUI\.([\w]+)\((.*)\)/;
        const printRegex = /print\((.*)\)/;
        const match = line.match(webUIRegex) || line.match(printRegex);
        
        if (match) {
            const action = match[1] || 'print';
            const params = match[2] || '';
            
            this.log('Matched action:', { action, params });
            
            // Extraire les paramètres
            const paramList = this.parseParameters(params);
            
            const actionInfo = {
                actionItem: 'WebUI Action',
                action: action,
                input: paramList.input,
                output: paramList.output,
                description: `Execute ${action} with parameters: ${params}`
            };
            
            this.log('Created action info:', actionInfo);
            return actionInfo;
        }
        
        this.log('No action match found');
        return null;
    }

    parseParameters(paramsString) {
        this.log('Parsing parameters:', paramsString);
        
        const params = paramsString.split(',').map(p => p.trim());
        let input = '';
        let output = '';
        
        params.forEach(param => {
            if (param.includes('findTestObject')) {
                input = param;
                this.log('Found findTestObject parameter:', input);
            } else if (param.includes('FailureHandling')) {
                output = param;
                this.log('Found FailureHandling parameter:', output);
            } else if (!input && (param.startsWith('"') || param.startsWith("'"))) {
                input = param.replace(/['"]/g, '');
                this.log('Found string parameter:', input);
            }
        });
        
        return { input, output };
    }

    convertStepToCode(step) {
        this.log('Converting step to code:', step);
        
        if (!step.action) {
            this.log('No action found in step');
            return null;
        }
        
        // Construire l'appel de fonction
        if (step.action === 'print') {
            const code = `print(${step.input || '"' + step.description + '"'})`;
            this.log('Generated print code:', code);
            return code;
        }
        
        // Construire l'appel WebUI
        let code = `WebUI.${step.action}(`;
        
        // Ajouter les paramètres
        const params = [];
        if (step.input) {
            if (step.input.includes('findTestObject')) {
                params.push(step.input);
            } else {
                params.push(`"${step.input}"`);
            }
        }
        
        if (step.output) {
            params.push(step.output);
        }
        
        code += params.join(', ');
        code += ')';
        
        this.log('Generated WebUI code:', code);
        return code;
    }
}

// Initialiser le convertisseur Python
document.addEventListener('DOMContentLoaded', () => {
    window.pythonConverter = new PythonConverter();
});
