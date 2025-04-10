import sys
from flask import Flask, render_template, jsonify, request
import os
import json
import shutil
import re

app = Flask(__name__)

# Structure d'un projet
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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/open_project', methods=['POST'])
def open_project():
    try:
        data = request.get_json()
        project_path = data.get('path')
        project_structure = data.get('structure')

        if not project_path or not project_structure:
            return jsonify({
                'success': False,
                'message': 'Project path and structure are required'
            })

        # Vérifier et filtrer la structure du projet
        filtered_structure = []
        for folder in project_structure:
            if folder['name'] in ['Profiles', 'report', 'settings']:
                # Toujours inclure ces dossiers
                filtered_structure.append(folder)
            elif folder['name'] in KATALON_FOLDERS and (
                'children' in folder and len(folder['children']) > 0
            ):
                filtered_structure.append(folder)

        return jsonify({
            'success': True,
            'project': {
                'name': project_path,
                'children': filtered_structure
            }
        })

    except Exception as e:
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
        return jsonify({
            'success': False,
            'message': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
