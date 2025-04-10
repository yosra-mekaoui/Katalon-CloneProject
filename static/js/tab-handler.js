class TabManager {
    constructor() {
<<<<<<< Updated upstream
        this.tabsList = document.querySelector('.tabs-list');
        this.activeTab = null;
        this.tabs = new Map(); // Store tab elements by file path
        this.init();
    }

    init() {
        // Listen for file opened events
        document.addEventListener('fileOpened', (e) => {
            const { path, name, content } = e.detail;
            this.openTab(path, name);
            
            // Trigger content update event
            const contentEvent = new CustomEvent('contentUpdate', {
                detail: { path, content }
            });
            document.dispatchEvent(contentEvent);
=======
        this.tabsBar = document.querySelector('.tabs-bar');
        this.activeTab = null;
        this.tabs = new Map();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Écouter les clics sur les fichiers dans la sidebar
        document.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file');
            if (fileItem) {
                const filePath = fileItem.dataset.path || fileItem.getAttribute('data-path');
                const fileName = fileItem.querySelector('span').textContent;
                this.openTab(filePath, fileName);
            }
>>>>>>> Stashed changes
        });
    }

    createTabElement(filePath, fileName) {
<<<<<<< Updated upstream
        const tab = document.createElement('li');
        tab.className = 'tab-item';
        tab.dataset.path = filePath;
        
        const fileIcon = document.createElement('i');
        fileIcon.className = this.getFileIcon(fileName);
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = fileName;
        
        const closeBtn = document.createElement('i');
        closeBtn.className = 'fas fa-times tab-close';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(filePath);
        });
        
        tab.appendChild(fileIcon);
        tab.appendChild(nameSpan);
        tab.appendChild(closeBtn);
        
        tab.addEventListener('click', () => this.activateTab(filePath));
        
        return tab;
    }

    getFileIcon(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'py':
                return 'fas fa-file-code';
            case 'js':
                return 'fab fa-js';
            case 'html':
                return 'fab fa-html5';
            case 'css':
                return 'fab fa-css3';
            case 'json':
                return 'fas fa-file-code';
            case 'xml':
                return 'fas fa-file-code';
            default:
                return 'fas fa-file';
        }
    }
=======
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.path = filePath;

        const titleSpan = document.createElement('span');
        titleSpan.className = 'tab-title';
        titleSpan.textContent = fileName;

        const closeButton = document.createElement('span');
        closeButton.className = 'tab-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(filePath);
        });

        tab.appendChild(titleSpan);
        tab.appendChild(closeButton);

        // ⚠️ Toujours charger le fichier quand on clique sur un onglet
        tab.addEventListener('click', () => {
            if (this.activeTab !== tab) { // Eviter de recharger si c'est le même onglet
                this.activateTab(filePath);
                this.loadFile(filePath);
            }
        });

        return tab;
    }

    async loadFile(filePath, projectPath) {
    console.log("Chargement du fichier:", filePath);
    try {
        const response = await fetch('/open_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: filePath,
                project_path: projectPath  // Send the project path here
            })
        });

        const data = await response.json();
        console.log('Réponse API:', data); // 🔍 Debug

        if (data.success) {
            document.dispatchEvent(new CustomEvent('fileLoaded', {
                detail: {
                    filePath: filePath,
                    content: data.content,
                    type: data.type,
                    manualSteps: data.manual_steps
                }
            }));
        } else {
            console.error('Erreur API:', data.message);
        }
    } catch (error) {
        console.error('Erreur lors du chargement du fichier:', error);
    }
}

>>>>>>> Stashed changes

    openTab(filePath, fileName) {
        if (!this.tabs.has(filePath)) {
            const tab = this.createTabElement(filePath, fileName);
<<<<<<< Updated upstream
            this.tabs.set(filePath, tab);
            this.tabsList.appendChild(tab);
        }
        this.activateTab(filePath);
    }

    activateTab(filePath) {
        if (this.activeTab) {
            this.activeTab.classList.remove('active');
        }
        
=======
            this.tabsBar.appendChild(tab);
            this.tabs.set(filePath, tab);
        }
        this.activateTab(filePath); // Activer l'onglet et charger le fichier si nécessaire
    }

    activateTab(filePath) {
        // Désactiver l'onglet actif précédent
        if (this.activeTab) {
            this.activeTab.classList.remove('active');
        }

        // Activer le nouvel onglet
>>>>>>> Stashed changes
        const tab = this.tabs.get(filePath);
        if (tab) {
            tab.classList.add('active');
            this.activeTab = tab;
<<<<<<< Updated upstream
            // Trigger an event that other components can listen to
            const event = new CustomEvent('tabActivated', {
                detail: { filePath }
            });
            document.dispatchEvent(event);
=======
>>>>>>> Stashed changes
        }
    }

    closeTab(filePath) {
        const tab = this.tabs.get(filePath);
        if (tab) {
<<<<<<< Updated upstream
            // If closing the active tab, activate another tab if available
            if (tab === this.activeTab) {
                const tabsArray = Array.from(this.tabs.entries());
                const currentIndex = tabsArray.findIndex(([path]) => path === filePath);
                const nextTab = tabsArray[currentIndex + 1] || tabsArray[currentIndex - 1];
                
                if (nextTab) {
                    this.activateTab(nextTab[0]);
=======
            // Si c'est l'onglet actif, activer le suivant ou le précédent
            if (tab === this.activeTab) {
                const tabArray = Array.from(this.tabs.keys());
                const currentIndex = tabArray.indexOf(filePath);
                const nextTab = tabArray[currentIndex + 1] || tabArray[currentIndex - 1];

                if (nextTab) {
                    this.activateTab(nextTab);
                    this.loadFile(nextTab); // ⚠️ Charger le fichier du nouvel onglet actif
>>>>>>> Stashed changes
                } else {
                    this.activeTab = null;
                }
            }
<<<<<<< Updated upstream
            
            tab.remove();
            this.tabs.delete(filePath);
            
            // Trigger tab closed event
            const event = new CustomEvent('tabClosed', {
                detail: { filePath }
            });
            document.dispatchEvent(event);
        }
    }
}
=======

            tab.remove();
            this.tabs.delete(filePath);
        }
    }
}

// Initialiser le gestionnaire d'onglets
document.addEventListener('DOMContentLoaded', () => {
    window.tabManager = new TabManager();
});
>>>>>>> Stashed changes
