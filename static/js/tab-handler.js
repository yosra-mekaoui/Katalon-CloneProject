class TabManager {
    constructor() {
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
        });
    }

    createTabElement(filePath, fileName) {
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

    openTab(filePath, fileName) {
        if (!this.tabs.has(filePath)) {
            const tab = this.createTabElement(filePath, fileName);
            this.tabs.set(filePath, tab);
            this.tabsList.appendChild(tab);
        }
        this.activateTab(filePath);
    }

    activateTab(filePath) {
        if (this.activeTab) {
            this.activeTab.classList.remove('active');
        }
        
        const tab = this.tabs.get(filePath);
        if (tab) {
            tab.classList.add('active');
            this.activeTab = tab;
            // Trigger an event that other components can listen to
            const event = new CustomEvent('tabActivated', {
                detail: { filePath }
            });
            document.dispatchEvent(event);
        }
    }

    closeTab(filePath) {
        const tab = this.tabs.get(filePath);
        if (tab) {
            // If closing the active tab, activate another tab if available
            if (tab === this.activeTab) {
                const tabsArray = Array.from(this.tabs.entries());
                const currentIndex = tabsArray.findIndex(([path]) => path === filePath);
                const nextTab = tabsArray[currentIndex + 1] || tabsArray[currentIndex - 1];
                
                if (nextTab) {
                    this.activateTab(nextTab[0]);
                } else {
                    this.activeTab = null;
                }
            }
            
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
