import sys
from flask import Flask, render_template, jsonify, request
import os
import json
import shutil

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

if __name__ == '__main__':
    app.run(debug=True, port=8001)
