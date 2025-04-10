// Configuration des dossiers
const FOLDER_CONFIG = {
    'Keywords': {
        extensions: ['.py'],
        icon: 'fas fa-key',
        allowSubfolders: true,
        showSubfolderContent: true,
        visible: true
    },
    'Object Repository': {
        extensions: ['.xml'],
        icon: 'fas fa-cube',
        allowSubfolders: true,
        showSubfolderContent: true,
        visible: true
    },
    'report': {
        icon: 'fas fa-chart-bar',
        showAllContent: true,
        allowSubfolders: true,
        showSubfolderContent: true,
        visible: true
    },
    'reports': {
        extensions: ['.xml'],
        icon: 'fas fa-chart-bar',
        openInEdge: true,
        visible: true
    },
    'Test Suites': {
        extensions: ['.xml', '.py'],
        icon: 'fas fa-layer-group',
        visible: true
    },
    'TestCases': {
        extensions: ['.py', '.xml'],
        icon: 'fas fa-file-code',
        allowSubfolders: true,
        showSubfolderContent: true,
        visible: true
    },
    'Profiles': {
        extensions: ['.glbl'],
        icon: 'fas fa-user-cog',
        allowSubfolders: true,
        showSubfolderContent: true,
        showAllContent: true,
        visible: true
    },
    'settings': {
        icon: 'fas fa-cog',
        showAllContent: true,
        allowSubfolders: true,
        showSubfolderContent: true,
        visible: true
    }
};

// Liste des dossiers autorisés dans l'ordre d'affichage
const ALLOWED_FOLDERS = [
    'Profiles',
    'TestCases',
    'Object Repository',
    'Test Suites',
    'Keywords',
    'report',
    'reports',
    'settings'
];

// Dossiers à cacher
const HIDDEN_FOLDERS = ['resources', 'Utils', 'WebUI'];

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    initializeFileMenu();
    initializeDefaultFolders();
});

function initializeFileMenu() {
    const fileMenu = document.getElementById('fileMenu');
    if (!fileMenu) {
        console.error('Menu File non trouvé');
        return;
    }

    const dropdownMenu = fileMenu.querySelector('.dropdown-menu');
    if (!dropdownMenu) {
        console.error('Dropdown menu non trouvé');
        return;
    }

    // Gestionnaire de clic pour le menu File
    fileMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Fermer le menu lors d'un clic ailleurs
    document.addEventListener('click', function() {
        dropdownMenu.style.display = 'none';
    });

    // Gestionnaire pour "Open Project"
    const openProjectBtn = document.getElementById('openProject');
    if (!openProjectBtn) {
        console.error('Bouton Open Project non trouvé');
        return;
    }

    openProjectBtn.addEventListener('click', handleFileSelect);
}

async function handleFileSelect(event) {
    try {
        const directoryHandle = await window.showDirectoryPicker();
        const files = [];
        const projectPath = directoryHandle.name;
        
        // Fonction récursive pour lire les fichiers
        async function readDirectory(dirHandle, path = '') {
            console.log('Reading directory:', path || 'root');
            for await (const entry of dirHandle.values()) {
                const entryPath = path ? `${path}/${entry.name}` : entry.name;
                console.log('Processing entry:', entry.name, 'of type:', entry.kind, 'at path:', entryPath);
                
                if (entry.kind === 'file') {
                    const file = await entry.getFile();
                    const fullPath = `${projectPath}/${entryPath}`;
                    console.log('Adding file:', fullPath);
                    files.push({
                        file: file,
                        path: entryPath,
                        webkitRelativePath: fullPath
                    });
                } else if (entry.kind === 'directory') {
                    console.log('Entering subdirectory:', entryPath);
                    await readDirectory(entry, entryPath);
                }
            }
        }

        // Lire tous les fichiers
        await readDirectory(directoryHandle);
        console.log("Tous les fichiers trouvés:", files.map(f => ({
            path: f.path,
            webkitRelativePath: f.webkitRelativePath
        })));
        
        // Créer la structure
        const structure = scanDirectory(files);
        
        // Envoyer au serveur
        const response = await fetch('/open_project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: projectPath,
                structure: structure
            })
        });

        const data = await response.json();
        if (data.success) {
            updateProjectTree(data.project);
        } else {
            console.error('Erreur:', data.message);
        }
    } catch (error) {
        console.error('Erreur lors de la sélection du dossier:', error);
    }
}

function initializeDefaultFolders() {
    // Ajouter les gestionnaires d'événements pour les flèches des dossiers
    document.querySelectorAll('.folder-content').forEach(folderContent => {
        folderContent.addEventListener('click', function(e) {
            e.stopPropagation(); // Empêcher la propagation de l'événement
            
            const arrow = this.querySelector('.folder-arrow');
            const folder = this.closest('.folder');
            const subfolderContent = folder.querySelector('.subfolder-content');
            
            if (arrow) {
                arrow.classList.toggle('rotated');
                if (subfolderContent) {
                    subfolderContent.classList.toggle('hidden');
                }
            }
        });
    });
}

function scanDirectory(fileList) {
    console.log("Début du scan avec", fileList.length, "fichiers");

    // Map pour stocker les dossiers principaux
    const mainFolders = {};
    ALLOWED_FOLDERS.forEach(folder => {
        mainFolders[folder] = {
            name: folder,
            type: 'directory',
            children: []
        };
    });

    // Traiter chaque fichier
    fileList.forEach(fileObj => {
        console.log("Traitement du fichier:", fileObj.path);
        const pathParts = fileObj.path.split('/');
        console.log("Parties du chemin:", pathParts);
        
        if (pathParts.length < 1) {
            console.log("Chemin trop court, ignoré");
            return;
        }

        const topLevelFolder = pathParts[0];
        console.log("Dossier principal:", topLevelFolder);
        const config = FOLDER_CONFIG[topLevelFolder];

        // Vérifier si c'est un dossier autorisé
        if (!config || !config.visible) {
            console.log("Dossier non autorisé ou non visible:", topLevelFolder);
            return;
        }

        let current = mainFolders[topLevelFolder];
        if (!current) {
            console.log("Dossier principal non trouvé dans mainFolders:", topLevelFolder);
            return;
        }

        // Gérer les fichiers dans les sous-dossiers
        if (pathParts.length > 1) {
            console.log("Traitement des sous-dossiers pour:", fileObj.path);
            // Parcourir la hiérarchie des sous-dossiers
            for (let i = 1; i < pathParts.length - 1; i++) {
                const subfolderName = pathParts[i];
                console.log("Traitement du sous-dossier:", subfolderName);
                
                // Vérifier si le sous-dossier existe déjà
                let subfolder = current.children.find(child => 
                    child.type === 'directory' && child.name === subfolderName
                );
                
                // Créer le sous-dossier s'il n'existe pas
                if (!subfolder) {
                    console.log("Création du sous-dossier:", subfolderName);
                    subfolder = {
                        name: subfolderName,
                        type: 'directory',
                        children: []
                    };
                    current.children.push(subfolder);
                } else {
                    console.log("Sous-dossier existant trouvé:", subfolderName);
                }
                
                current = subfolder;
            }
        }

        // Ajouter le fichier au dossier courant
        const fileName = pathParts[pathParts.length - 1];
        console.log("Tentative d'ajout du fichier:", fileName, "dans le dossier:", current.name);
        if (shouldShowFile(fileName, topLevelFolder, pathParts.length > 1)) {
            console.log("Ajout du fichier:", fileName);
            current.children.push({
                name: fileName,
                type: 'file',
                path: fileObj.webkitRelativePath
            });
        } else {
            console.log("Fichier non autorisé:", fileName);
        }
    });

    // Ajouter les dossiers principaux à la structure finale
    const structure = [];
    ALLOWED_FOLDERS.forEach(folder => {
        if (mainFolders[folder] && (
            folder === 'Profiles' || 
            mainFolders[folder].children.length > 0
        )) {
            console.log("Ajout du dossier principal à la structure:", folder, "avec", mainFolders[folder].children.length, "enfants");
            structure.push(mainFolders[folder]);
        }
    });

    console.log("Structure finale:", JSON.stringify(structure, null, 2));
    return structure;
}

function shouldShowFile(fileName, folderName, isInSubfolder = false) {
    const config = FOLDER_CONFIG[folderName];
    if (!config) return false;
    
    // Pour les dossiers qui montrent tout le contenu
    if (config.showAllContent) return true;
    
    // Cas spécial pour Profiles : accepter tous les fichiers .glbl
    if (folderName === 'Profiles' && fileName.toLowerCase().endsWith('.glbl')) {
        return true;
    }
    
    // Vérifier les extensions
    if (!config.extensions) return true;
    return config.extensions.some(ext => 
        fileName.toLowerCase().endsWith(ext.toLowerCase())
    );
}

function createFolderElement(folder) {
    console.log("Création de l'élément dossier:", folder.name, "avec enfants:", folder.children);
    const li = document.createElement('li');
    li.className = 'folder';
    
    const folderContent = document.createElement('div');
    folderContent.className = 'folder-content';
    
    const icon = document.createElement('i');
    icon.className = FOLDER_CONFIG[folder.name]?.icon || 'fas fa-folder';
    
    const span = document.createElement('span');
    span.textContent = folder.name;
    
    const arrow = document.createElement('i');
    arrow.className = 'fas fa-chevron-right folder-arrow';
    
    folderContent.appendChild(arrow);
    folderContent.appendChild(icon);
    folderContent.appendChild(span);
    li.appendChild(folderContent);
    
    if (folder.children && folder.children.length > 0) {
        console.log(`Création des sous-éléments pour ${folder.name}:`, folder.children);
        const ul = document.createElement('ul');
        ul.className = 'subfolder-content hidden';
        
        folder.children.forEach(child => {
            if (child.type === 'directory') {
                console.log("Création récursive du sous-dossier:", child.name);
                ul.appendChild(createFolderElement(child));
            } else {
                console.log("Création de l'élément fichier:", child.name);
                const fileLi = document.createElement('li');
                fileLi.className = 'file';
                
                const fileIcon = document.createElement('i');
                fileIcon.className = getFileIcon(child.name);
                
                const fileSpan = document.createElement('span');
                fileSpan.textContent = child.name;
                
                fileLi.appendChild(fileIcon);
                fileLi.appendChild(fileSpan);
                fileLi.setAttribute('data-path', child.path);
                
                fileLi.addEventListener('click', () => handleFileClick(child.path));
                
                ul.appendChild(fileLi);
            }
        });
        
        li.appendChild(ul);
        
        // Ajouter l'événement de clic pour le dossier
        folderContent.addEventListener('click', () => {
            arrow.classList.toggle('rotated');
            ul.classList.toggle('hidden');
        });
    }
    
    return li;
}

function updateProjectTree(project) {
    console.log("Mise à jour de l'arbre du projet avec:", project);
    const projectTree = document.getElementById('projectTree');
    if (!projectTree) {
        console.error("Élément projectTree non trouvé");
        return;
    }

    // Sauvegarder l'état des dossiers
    const folderStates = {};
    projectTree.querySelectorAll('.folder').forEach(folder => {
        const folderName = folder.querySelector('span').textContent;
        const arrow = folder.querySelector('.folder-arrow');
        folderStates[folderName] = {
            isOpen: arrow ? arrow.classList.contains('rotated') : false
        };
    });

    // Mettre à jour le contenu des sous-dossiers
    if (project.children) {
        project.children.forEach(folder => {
            // Trouver le dossier existant par son nom
            const existingFolder = Array.from(projectTree.querySelectorAll('.folder')).find(el => 
                el.querySelector('span').textContent === folder.name
            );
            
            if (existingFolder) {
                const subfolderContent = existingFolder.querySelector('.subfolder-content');
                if (subfolderContent) {
                    // Vider le contenu existant
                    subfolderContent.innerHTML = '';
                    
                    // Ajouter les nouveaux éléments
                    if (folder.children && folder.children.length > 0) {
                        folder.children.forEach(child => {
                            if (child.type === 'directory') {
                                const subfolderElement = createFolderElement(child);
                                subfolderContent.appendChild(subfolderElement);
                            } else {
                                const fileElement = document.createElement('li');
                                fileElement.className = 'file';
                                
                                const fileIcon = document.createElement('i');
                                fileIcon.className = getFileIcon(child.name);
                                
                                const fileSpan = document.createElement('span');
                                fileSpan.textContent = child.name;
                                
                                fileElement.appendChild(fileIcon);
                                fileElement.appendChild(fileSpan);
                                fileElement.setAttribute('data-path', child.path);
                                
                                fileElement.addEventListener('click', () => handleFileClick(child.path));
                                
                                subfolderContent.appendChild(fileElement);
                            }
                        });
                    }
                }
            }
        });
    }

    // Restaurer l'état des dossiers
    Object.entries(folderStates).forEach(([folderName, state]) => {
        const folder = Array.from(projectTree.querySelectorAll('.folder')).find(el => 
            el.querySelector('span').textContent === folderName
        );
        
        if (folder && state.isOpen) {
            const arrow = folder.querySelector('.folder-arrow');
            const subfolderContent = folder.querySelector('.subfolder-content');
            if (arrow && subfolderContent) {
                arrow.classList.add('rotated');
                subfolderContent.classList.remove('hidden');
            }
        }
    });
}

// Ajouter les styles CSS nécessaires
const style = document.createElement('style');
style.textContent = `
    .folder {
        position: relative;
    }
    .folder-content {
        position: relative;
        z-index: 1;
    }
    .subfolder-content {
        position: relative;
        z-index: 0;
    }
    .folder-arrow {
        transition: transform 0.2s;
        margin-right: 5px;
    }
    .folder-arrow.rotated {
        transform: rotate(90deg);
    }
    .subfolder-content.hidden {
        display: none;
    }
    .subfolder-content {
        margin-left: 20px;
    }
`;
document.head.appendChild(style);

function initializeFolderHandlers() {
    // Add click handlers to all folders
    const folders = document.querySelectorAll('.folder');
    folders.forEach(folder => {
        folder.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Toggle the folder open/closed state
            const ul = this.nextElementSibling;
            if (ul) {
                const isOpen = this.classList.toggle('open');
                if (isOpen) {
                    ul.style.display = 'block';
                } else {
                    ul.style.display = 'none';
                }
            }
        });
    });
}

function initializeTestStepsTable() {
    // Sélection des lignes dans la table
    const testStepsTable = document.querySelector('.test-steps');
    if (testStepsTable) {
        testStepsTable.addEventListener('click', function(e) {
            const tr = e.target.closest('tr');
            if (tr && !tr.closest('thead')) {
                document.querySelectorAll('.test-steps tbody tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
            }
        });
    }

    // Gestion des boutons d'action
    const addButton = document.querySelector('.action-btn:nth-child(1)');
    const deleteButton = document.querySelector('.action-btn:nth-child(2)');
    const moveUpButton = document.querySelector('.action-btn:nth-child(3)');
    const moveDownButton = document.querySelector('.action-btn:nth-child(4)');

    if (addButton) {
        addButton.addEventListener('click', function() {
            const tbody = document.querySelector('.test-steps tbody');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${tbody.children.length + 1} - New Step</td>
                <td>Object</td>
                <td>Action</td>
                <td>Input</td>
                <td>Description</td>
            `;
            tbody.appendChild(newRow);
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            const selectedRow = document.querySelector('.test-steps tr.selected');
            if (selectedRow) {
                selectedRow.remove();
                updateStepNumbers();
            }
        });
    }

    // Gestion du déplacement des étapes
    if (moveUpButton) {
        moveUpButton.addEventListener('click', function() {
            const selectedRow = document.querySelector('.test-steps tr.selected');
            if (selectedRow && selectedRow.previousElementSibling) {
                selectedRow.parentNode.insertBefore(selectedRow, selectedRow.previousElementSibling);
                updateStepNumbers();
            }
        });
    }

    if (moveDownButton) {
        moveDownButton.addEventListener('click', function() {
            const selectedRow = document.querySelector('.test-steps tr.selected');
            if (selectedRow && selectedRow.nextElementSibling) {
                selectedRow.parentNode.insertBefore(selectedRow.nextElementSibling, selectedRow);
                updateStepNumbers();
            }
        });
    }

    // Mise à jour des numéros d'étapes
    function updateStepNumbers() {
        const rows = document.querySelectorAll('.test-steps tbody tr');
        rows.forEach((row, index) => {
            const stepCell = row.cells[0];
            const stepText = stepCell.textContent.split('-')[1].trim();
            stepCell.textContent = `${index + 1} - ${stepText}`;
        });
    }
}

function initializeViewTabs() {
    // Gestion des onglets de vue (Manual/Script/Variables)
    const viewTabs = document.querySelectorAll('.view-tab');
    viewTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            viewTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Changement de vue en fonction de l'onglet
            const viewType = tab.textContent.trim().toLowerCase();
            const testContent = document.querySelector('.test-content');
            
            switch(viewType) {
                case 'manual':
                    testContent.querySelector('.test-steps').style.display = 'table';
                    break;
                case 'script':
                    // Ici, vous pouvez ajouter la logique pour afficher le code
                    break;
                case 'variables':
                    // Ici, vous pouvez ajouter la logique pour afficher les variables
                    break;
            }
        });
    });
}

function initializeStatusBarTabs() {
    // Gestion des onglets de la barre de statut
    const statusTabs = document.querySelectorAll('.status-bar .tab');
    statusTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            statusTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

function initializeToolButtons() {
    // Gestion des boutons de la barre d'outils
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Ajouter ici la logique pour chaque bouton
            console.log('Tool button clicked:', button.innerHTML);
        });
    });
}

function handleFileClick(filePath) {
    console.log("Clic sur le fichier:", filePath);
    const fileExtension = filePath.split('.').pop().toLowerCase();
    
    if (fileExtension === 'glbl') {
        // Traitement spécial pour les fichiers .glbl
        console.log("Ouverture d'un fichier .glbl");
        // Ajouter ici le code pour ouvrir les fichiers .glbl
    } else {
        // Traitement normal pour les autres fichiers
        fetch('/open_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filePath: filePath })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Fichier ouvert avec succès");
            } else {
                console.error("Erreur lors de l'ouverture du fichier");
            }
        })
        .catch(error => console.error('Erreur:', error));
    }
}

function getFileIcon(fileName) {
    if (fileName.endsWith('.py')) return 'fab fa-python';
    if (fileName.endsWith('.xml')) return 'fas fa-file-code';
    if (fileName.endsWith('.glbl')) return 'fas fa-globe';
    return 'fas fa-file';
}
