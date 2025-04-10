from flask import Flask, render_template, jsonify, request
import os
import json
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import shutil
import re
=======
=======
>>>>>>> Stashed changes
import logging
import re
import ast

# Configuration du logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

app = Flask(__name__)

# Structure d'un projet Katalon avec les dossiers et sous-dossiers à vérifier
KATALON_FOLDERS = [
    'Profiles',
    'TestCases',
    'Object Repository',
    'Test Suites',
    'Keywords',
    'report',
    'reports',
    'settings'
]

# Configuration des extensions de fichiers par dossier
FOLDER_CONFIG = {
    'Keywords': {
        'extensions': ['.py'],
        'allow_subdirs': True,
        'readable': True
    },
    'Object Repository': {
        'extensions': ['.xml'],
        'allow_subdirs': True,
        'readable': True
    },
    'report': {
        'extensions': ['*'],
        'allow_subdirs': True,
        'readable': True,
        'show_all': True
    },
    'reports': {
        'extensions': ['.xml'],
        'allow_subdirs': False,
        'readable': False,
        'open_with': 'edge'
    },
    'TestCases': {
        'extensions': ['.py', '.xml'],
        'allow_subdirs': True,
        'readable': True
    },
    'Test Suites': {
        'extensions': ['.xml', '.py'],
        'allow_subdirs': True,
        'readable': True
    },
    'Profiles': {
        'extensions': ['.glbl'],
        'allow_subdirs': True,
        'readable': True,
        'show_all': True
    },
    'settings': {
        'extensions': ['*'],
        'allow_subdirs': True,
        'readable': True,
        'show_all': True
    }
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
# Fonctions utilitaires pour la conversion
def parse_script_to_json(code):
    steps = []
    if_pattern = re.compile(r"if\s*\((.*?)\)\s*\{([^}]*)\}", re.DOTALL)
    action_pattern = re.compile(r"WebUI\.(\w+)\((.*?)\)", re.DOTALL)

    match = if_pattern.search(code)
    if match:
        condition = match.group(1).strip()
        body = match.group(2).strip()

        then_steps = []
        for action_match in action_pattern.finditer(body):
            action = action_match.group(1)
            params = action_match.group(2).strip()
            then_steps.append({"action": action, "params": [params]})

        steps.append({
            "type": "if",
            "condition": condition,
            "then": then_steps
        })

    for action_match in action_pattern.finditer(code):
        action = action_match.group(1)
        params = action_match.group(2).strip()
        steps.append({"action": action, "params": [params]})

    return {"test_steps": steps}

def json_to_script(json_data):
    script_lines = []

    for step in json_data.get("test_steps", []):
        if step.get("type") == "if":
            condition = step.get("condition")
            script_lines.append(f"if ({condition}) {{")

            for action in step.get("then", []):
                action_name = action["action"]
                params = ", ".join(action["params"])
                script_lines.append(f"\tWebUI.{action_name}({params})")

            script_lines.append("}")
        else:
            action_name = step["action"]
            params = ", ".join(step["params"])
            script_lines.append(f"WebUI.{action_name}({params})")

    return "\n".join(script_lines)

=======
=======
>>>>>>> Stashed changes

# Classe pour parser un fichier Python
class PythonFileParser:
    def __init__(self):
        self.imports = []
        self.configurations = []
        self.steps = []

    def preserve_imports(self, script_code):
        required_imports = [
            "import json",
            "import logging",
            "from WebUI import BuiltinKeywords",
            "from WebUI.BuiltinKeywords import WebUiBuiltInKeywords as WebUI",
            "from WebUI.DriverFactory import DriverFactory"
        ]

        for imp in required_imports:
            if imp not in script_code:
                script_code = imp + "\n" + script_code  # Réinsérer l'import s'il manque

        return script_code

    def parse_file(self, content):
        logger.info("Début de l'analyse du fichier Python")
        try:
            tree = ast.parse(content)

            # Extraire les imports et configurations
            for node in ast.walk(tree):


                if isinstance(node, (ast.Import, ast.ImportFrom)):
                    self.imports.append(content[node.lineno - 1])
                    logger.debug(f"Import trouvé: {content[node.lineno - 1]}")
                elif isinstance(node, ast.Assign):
                    # Capturer les configurations comme RunConfiguration et findTestObject
                    line = content[node.lineno - 1]
                    if any(keyword in line for keyword in
                           ['RunConfiguration', 'findTestObject', 'file_path', 'prope', 'driver']):
                        self.configurations.append(line)
                        logger.debug(f"Configuration trouvée: {line}")

            # Extraire les étapes
            for node in ast.walk(tree):
                if isinstance(node, ast.Call):
                    if hasattr(node.func, 'value') and hasattr(node.func.value, 'id'):
                        if node.func.value.id == 'WebUI':
                            step = self.parse_webui_call(node, content)
                            if step:
                                self.steps.append(step)
                                logger.debug(f"Étape WebUI trouvée: {step}")

            logger.info(
                f"Analyse terminée: {len(self.imports)} imports, {len(self.configurations)} configs, {len(self.steps)} étapes")
            return True
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse du fichier: {str(e)}")
            return False

    def parse_webui_call(self, node, content):
        try:
            action = node.func.attr
            params = []

            for arg in node.args:
                if isinstance(arg, ast.Call) and isinstance(arg.func, ast.Name) and arg.func.id == 'findTestObject':
                    # Extraire l'argument de findTestObject
                    if arg.args and isinstance(arg.args[0], ast.Str):
                        params.append(f"findTestObject('{arg.args[0].s}')")
                elif isinstance(arg, ast.Str):
                    params.append(f"'{arg.s}'")
                elif isinstance(arg, ast.Num):
                    params.append(str(arg.n))
                else:
                    # Récupérer le texte original pour les autres types d'arguments
                    line = content[node.lineno - 1]
                    start = node.col_offset
                    end = node.end_col_offset
                    params.append(line[start:end])

            return {
                'action': action,
                'params': params,
                'line': content[node.lineno - 1].strip()
            }
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse d'un appel WebUI: {str(e)}")
            return None

    def generate_script(self, manual_steps):
        logger.info("Début de la génération du script")
        script = ""

        # Ajouter les imports
        for imp in self.imports:
            script += imp + "\n"
        if self.imports:
            script += "\n"

        # Ajouter les configurations
        for config in self.configurations:
            script += config + "\n"
        if self.configurations:
            script += "\n"

        # Ajouter les étapes
        for step in manual_steps:
            try:
                if not step.get('action'):
                    continue

                action = step['action']
                params = []

                if step.get('input'):
                    if 'findTestObject' in step['input']:
                        params.append(step['input'])
                    else:
                        params.append(f"'{step['input']}'")

                if step.get('output'):
                    params.append(step['output'])

                line = f"WebUI.{action}({', '.join(params)})"
                script += line + "\n"
                logger.debug(f"Ligne générée: {line}")

            except Exception as e:
                logger.error(f"Erreur lors de la génération d'une étape: {str(e)}")
                continue

        logger.info("Génération du script terminée")
        return script


# Route pour la page d'accueil
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
@app.route('/')
def index():
    return render_template('index.html')


# Route pour ouvrir un projet
@app.route('/open_project', methods=['POST'])
def open_project():
    try:
        data = request.get_json()
        project_path = data.get('path')
        project_structure = data.get('structure')

        logger.info(f"Ouverture du projet: {project_path}")

        if not project_path or not project_structure:
            logger.error("Project path and structure are required")
            return jsonify({
                'success': False,
                'message': 'Project path and structure are required'
            })

        # Vérifier et filtrer la structure du projet
        filtered_structure = []
        for folder in project_structure:
            folder_info = {
                'name': folder['name'],
                'type': 'directory',
                'children': folder.get('children', [])  # Assurer que children existe toujours
            }

            if folder['name'] in ['Profiles', 'report', 'settings']:
                # Toujours inclure ces dossiers
                filtered_structure.append(folder_info)
            elif folder['name'] in KATALON_FOLDERS:
                filtered_structure.append(folder_info)

        logger.info("Structure du projet filtrée avec succès")
        return jsonify({
            'success': True,
            'project': {
                'name': project_path,
                'children': filtered_structure
            }
        })

    except Exception as e:
        logger.error(f"Erreur lors de l'ouverture du projet: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        })


# Route pour ouvrir un fichier
@app.route('/open_file', methods=['POST'])
def open_file():
    try:
        data = request.get_json()
        file_path = data.get('path')
        project_path = data.get('project_path', '')

        if not file_path:
            return jsonify({
                'success': False,
                'message': 'File path is required'
            })

        # Construire le chemin absolu
        absolute_path = os.path.join(project_path, file_path)

        if not os.path.exists(absolute_path):
            return jsonify({
                'success': False,
                'message': f'File not found: {absolute_path}'
            })

        with open(absolute_path, 'r') as file:
            content = file.read()

        # Afficher le contenu du fichier pour le débogage
        print(f"Contenu du fichier: {content}")

        # Parser le contenu Python en étapes
        parsed_content = []
        if content:
            try:
                # Extraire les appels de fonction du contenu Python
                pattern = r'(\w+)\("([^"]*)"\s*(?:,\s*"([^"]*)")?\)'
                matches = re.finditer(pattern, content)

                for match in matches:
                    action = match.group(1)
                    target = match.group(2)
                    value = match.group(3) or ''

                    parsed_content.append({
                        'action': action,
                        'target': target,
                        'value': value
                    })
            except Exception as e:
                print(f"Erreur lors du parsing: {str(e)}")
                parsed_content = []

        return jsonify({
            'success': True,
            'content': content,
            'parsed_content': parsed_content
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })
@app.route('/save_file', methods=['POST'])
def save_file():
    try:
        data = request.get_json()
        file_path = data.get('path')
        content = data.get('content')
        project_path = data.get('project_path', '')

        if not file_path or content is None:
            return jsonify({
                'success': False,
                'message': 'File path and content are required'
            })
        # Construire le chemin absolu
        file_path = file_path.replace('pythonProjectSeleniumV4/pythonProjectSeleniumV4/', '')
        absolute_path = os.path.join(project_path, file_path)

        # Vérifier si le fichier existe
        if not os.path.exists(absolute_path):
            return jsonify({
                'success': False,
                'message': f'File not found: {absolute_path}'
            })

        # Si c'est un fichier Python, s'assurer que le contenu est bien formaté
        if absolute_path.endswith('.py'):
            # Vérifier si le contenu est déjà un script Python
            if not content.strip().startswith('def test():'):
                # Si ce n'est pas le cas, le convertir en script Python
                steps = []
                try:
                    # Supposer que le contenu est une liste d'étapes
                    parsed_steps = json.loads(content)
                    for step in parsed_steps:
                        action = step.get('action', '')
                        target = step.get('target', '')
                        value = step.get('value', '')

                        if value:
                            steps.append(f'    {action}("{target}", "{value}")')
                        else:
                            steps.append(f'    {action}("{target}")')
                except json.JSONDecodeError:
                    # Si ce n'est pas du JSON valide, sauvegarder tel quel
                    steps = [content]

                content = 'def test():\n' + '\n'.join(steps)

        # Sauvegarder le contenu dans le fichier
        with open(absolute_path, 'w') as file:
            file.write(content)

        return jsonify({
            'success': True,
            'message': 'File saved successfully'
        })
    except Exception as e:
<<<<<<< Updated upstream
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/read_py_file', methods=['POST'])
def read_py_file():
    try:
        data = request.get_json()
        file_path = data.get('path')
        
        if not file_path or not file_path.endswith('.py'):
            return jsonify({
                'success': False,
                'message': 'Invalid Python file path'
            })

        with open(file_path, 'r') as file:
            content = file.read()
            
        return jsonify({
            'success': True,
            'content': content
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/save_py_file', methods=['POST'])
def save_py_file():
    try:
        data = request.get_json()
        file_path = data.get('path')
        content = data.get('content')
        
        if not file_path or not file_path.endswith('.py'):
            return jsonify({
                'success': False,
                'message': 'Invalid Python file path'
            })

        with open(file_path, 'w') as file:
            file.write(content)
            
        return jsonify({
            'success': True,
            'message': 'File saved successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/open_file', methods=['POST'])
def open_file():
    try:
        data = request.get_json()
        file_path = data.get('path')
        project_path = data.get('project_path', '')

        if not file_path:
            return jsonify({
                'success': False,
                'message': 'File path is required'
            })

        # Construire le chemin absolu
        file_path = file_path.replace('pythonProjectSeleniumV4/pythonProjectSeleniumV4/', '')
        absolute_path = os.path.join(project_path, file_path)

        if not os.path.exists(absolute_path):
            return jsonify({
                'success': False,
                'message': f'File not found: {absolute_path}'
            })

        with open(absolute_path, 'r') as file:
            content = file.read()

        # Parser le contenu Python en étapes
        parsed_content = []
        if content:
            try:
                # Extraire les appels de fonction du contenu Python
                pattern = r'(\w+)\("([^"]*)"\s*(?:,\s*"([^"]*)")?\)'
                matches = re.finditer(pattern, content)
                
                for match in matches:
                    action = match.group(1)
                    target = match.group(2)
                    value = match.group(3) or ''
                    
                    parsed_content.append({
                        'action': action,
                        'target': target,
                        'value': value
                    })
            except Exception as e:
                print(f"Erreur lors du parsing: {str(e)}")
                parsed_content = []

        return jsonify({
            'success': True,
            'content': content,
            'parsed_content': parsed_content
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/save_file', methods=['POST'])
def save_file():
    try:
        data = request.get_json()
        file_path = data.get('path')
        content = data.get('content')
        project_path = data.get('project_path', '')
        
        if not file_path or content is None:
            return jsonify({
                'success': False,
                'message': 'File path and content are required'
            })

        # Construire le chemin absolu
        file_path = file_path.replace('pythonProjectSeleniumV4/pythonProjectSeleniumV4/', '')
        absolute_path = os.path.join(project_path, file_path)
        
        # Vérifier si le fichier existe
        if not os.path.exists(absolute_path):
            return jsonify({
                'success': False,
                'message': f'File not found: {absolute_path}'
            })

        # Si c'est un fichier Python, s'assurer que le contenu est bien formaté
        if absolute_path.endswith('.py'):
            # Vérifier si le contenu est déjà un script Python
            if not content.strip().startswith('def test():'):
                # Si ce n'est pas le cas, le convertir en script Python
                steps = []
                try:
                    # Supposer que le contenu est une liste d'étapes
                    parsed_steps = json.loads(content)
                    for step in parsed_steps:
                        action = step.get('action', '')
                        target = step.get('target', '')
                        value = step.get('value', '')
                        
                        if value:
                            steps.append(f'    {action}("{target}", "{value}")')
                        else:
                            steps.append(f'    {action}("{target}")')
                except json.JSONDecodeError:
                    # Si ce n'est pas du JSON valide, sauvegarder tel quel
                    steps = [content]

                content = 'def test():\n' + '\n'.join(steps)

        # Sauvegarder le contenu dans le fichier
        with open(absolute_path, 'w') as file:
            file.write(content)
            
        return jsonify({
            'success': True,
            'message': 'File saved successfully'
        })
    except Exception as e:
=======
>>>>>>> Stashed changes
        return jsonify({
            'success': False,
            'message': str(e)
        })

if __name__ == '__main__':
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    app.run(debug=True, port=5001)
=======
    app.run(debug=True, port=5008)
>>>>>>> Stashed changes
=======
    app.run(debug=True, port=5008)
>>>>>>> Stashed changes
