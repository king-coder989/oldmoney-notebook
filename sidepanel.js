class PaperNotebook {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.pages = new Map();
        this.isFlipping = false;
        this.dragCounter = 0;
        
        this.init();
        this.loadNotebook();
        this.setupEventListeners();
    }

    init() {
        this.pagesContainer = document.getElementById('pages-container');
        this.currentPageNum = document.getElementById('currentPageNum');
        this.totalPagesNum = document.getElementById('totalPages');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.addBtn = document.getElementById('add-btn');
        this.dropZone = document.getElementById('drop-zone');
    }

    setupEventListeners() {
        // Navigation
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        this.addBtn.addEventListener('click', () => this.addNewPage());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousPage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextPage();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.addNewPage();
                        break;
                }
            }
        });

        // Drag and drop
        this.setupDragAndDrop();

        // Auto-save
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('note-item') || e.target.classList.contains('page-content')) {
                this.debounce(() => this.saveNotebook(), 500)();
            }
        });

        // Handle Enter key for new lines
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('page-content') && e.key === 'Enter') {
                e.preventDefault();
                this.addNewLine();
            }
        });
    }

    setupDragAndDrop() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.pagesContainer.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone
        ['dragenter', 'dragover'].forEach(eventName => {
            this.pagesContainer.addEventListener(eventName, () => this.highlight(), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.pagesContainer.addEventListener(eventName, () => this.unhighlight(), false);
        });

        // Handle drop
        this.pagesContainer.addEventListener('drop', (e) => this.handleDrop(e), false);

        // Track drag enter/leave for nested elements
        this.pagesContainer.addEventListener('dragenter', (e) => {
            this.dragCounter++;
        });

        this.pagesContainer.addEventListener('dragleave', (e) => {
            this.dragCounter--;
            if (this.dragCounter === 0) {
                this.unhighlight();
            }
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight() {
        this.dropZone.classList.add('active');
        this.dragCounter = 1;
    }

    unhighlight() {
        this.dropZone.classList.remove('active');
        this.dragCounter = 0;
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const text = dt.getData('text/plain');
        
        if (text.trim()) {
            this.addDroppedText(text.trim());
        }
        
        this.unhighlight();
    }

    addDroppedText(text) {
        const currentPageElement = this.getCurrentPageElement();
        const pageContent = currentPageElement.querySelector('.page-content');
        
        // Create new note item for dropped text
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item dragged-text';
        noteItem.contentEditable = true;
        noteItem.textContent = text;
        
        // Add to current page
        pageContent.appendChild(noteItem);
        
        // Focus on the new item
        noteItem.focus();
        
        // Save immediately
        this.saveNotebook();
        
        // Remove highlight class after animation
        setTimeout(() => {
            noteItem.classList.remove('dragged-text');
        }, 1000);
    }

    addNewLine() {
        const currentPageElement = this.getCurrentPageElement();
        const pageContent = currentPageElement.querySelector('.page-content');
        
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.contentEditable = true;
        
        pageContent.appendChild(noteItem);
        noteItem.focus();
    }

    getCurrentPageElement() {
        return document.querySelector(`[data-page="${this.currentPage}"]`);
    }

    previousPage() {
        if (this.currentPage > 1 && !this.isFlipping) {
            this.flipToPage(this.currentPage - 1);
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages && !this.isFlipping) {
            this.flipToPage(this.currentPage + 1);
        }
    }

    flipToPage(pageNumber) {
        if (this.isFlipping || pageNumber === this.currentPage) return;
        
        this.isFlipping = true;
        const currentPageElement = this.getCurrentPageElement();
        const targetPageElement = document.querySelector(`[data-page="${pageNumber}"]`);
        
        if (!targetPageElement) {
            this.isFlipping = false;
            return;
        }

        // Animate current page flipping out
        currentPageElement.classList.add('flipping-out');
        
        // Show target page behind
        targetPageElement.style.display = 'block';
        targetPageElement.classList.add('flipping-in');
        
        setTimeout(() => {
            // Hide current page
            currentPageElement.style.display = 'none';
            currentPageElement.classList.remove('flipping-out');
            
            // Show target page
            targetPageElement.classList.remove('flipping-in');
            
            this.currentPage = pageNumber;
            this.updateUI();
            this.isFlipping = false;
        }, 600);
    }

    addNewPage() {
        this.totalPages++;
        const newPage = this.createPageElement(this.totalPages);
        this.pagesContainer.appendChild(newPage);
        
        // Hide the new page initially
        newPage.style.display = 'none';
        
        this.updateUI();
        this.saveNotebook();
        
        // Flip to the new page
        this.flipToPage(this.totalPages);
    }

    createPageElement(pageNumber) {
        const page = document.createElement('div');
        page.className = 'page';
        page.setAttribute('data-page', pageNumber);
        
        page.innerHTML = `
            <div class="page-content" contenteditable="true">
                <div class="note-item" contenteditable="true"></div>
            </div>
            <div class="page-number">${pageNumber}</div>
        `;
        
        return page;
    }

    updateUI() {
        this.currentPageNum.textContent = this.currentPage;
        this.totalPagesNum.textContent = this.totalPages;
        
        this.prevBtn.disabled = this.currentPage === 1;
        this.nextBtn.disabled = this.currentPage === this.totalPages;
        
        // Show only current page
        document.querySelectorAll('.page').forEach((page, index) => {
            const pageNum = parseInt(page.getAttribute('data-page'));
            if (pageNum === this.currentPage) {
                page.style.display = 'block';
            } else {
                page.style.display = 'none';
            }
        });
    }

    saveNotebook() {
        const notebookData = {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            pages: {}
        };

        // Save content of each page
        document.querySelectorAll('.page').forEach(page => {
            const pageNum = parseInt(page.getAttribute('data-page'));
            const pageContent = page.querySelector('.page-content');
            notebookData.pages[pageNum] = pageContent.innerHTML;
        });

        // Use Chrome storage API if available, otherwise localStorage
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ notebookData }, () => {
                console.log('Notebook saved to Chrome storage');
            });
        } else {
            localStorage.setItem('paperNotebook', JSON.stringify(notebookData));
        }
    }

    loadNotebook() {
        const loadData = (data) => {
            if (data) {
                this.currentPage = data.currentPage || 1;
                this.totalPages = data.totalPages || 1;
                
                // Clear existing pages except the first one
                const existingPages = document.querySelectorAll('.page');
                existingPages.forEach((page, index) => {
                    if (index > 0) page.remove();
                });
                
                // Load all pages
                for (let i = 1; i <= this.totalPages; i++) {
                    if (i === 1) {
                        // Update first page
                        const firstPage = document.querySelector('[data-page="1"]');
                        if (data.pages && data.pages[1]) {
                            firstPage.querySelector('.page-content').innerHTML = data.pages[1];
                        }
                    } else {
                        // Create additional pages
                        const newPage = this.createPageElement(i);
                        if (data.pages && data.pages[i]) {
                            newPage.querySelector('.page-content').innerHTML = data.pages[i];
                        }
                        this.pagesContainer.appendChild(newPage);
                    }
                }
                
                this.updateUI();
            }
        };

        // Try Chrome storage first, then localStorage
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['notebookData'], (result) => {
                loadData(result.notebookData);
            });
        } else {
            const saved = localStorage.getItem('paperNotebook');
            if (saved) {
                loadData(JSON.parse(saved));
            }
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the notebook when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notebook = new PaperNotebook();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.notebook = new PaperNotebook();
    });
} else {
    window.notebook = new PaperNotebook();
}
