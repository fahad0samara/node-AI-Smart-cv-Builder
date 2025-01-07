export class SettingsManager {
    constructor() {
        this.modal = null;
        this.preferences = null;
        this.history = [];
        this.customTemplates = [];
        
        this.initializeModal();
        this.loadPreferences();
        this.loadHistory();
        this.loadCustomTemplates();
    }

    initializeModal() {
        // Create modal HTML
        const modalHtml = `
            <div class="modal" id="settingsModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Settings</h2>
                        <button class="close-button">&times;</button>
                    </div>
                    <div class="modal-tabs">
                        <button class="tab-button active" data-tab="preferences">Preferences</button>
                        <button class="tab-button" data-tab="history">History</button>
                        <button class="tab-button" data-tab="templates">Custom Templates</button>
                    </div>
                    <div class="tab-content">
                        <div class="tab-pane active" id="preferences">
                            <form id="preferencesForm">
                                <div class="form-group">
                                    <label for="userName">Name</label>
                                    <input type="text" id="userName" class="input" placeholder="Your name">
                                </div>
                                <div class="form-group">
                                    <label for="userEmail">Email</label>
                                    <input type="email" id="userEmail" class="input" placeholder="Your email">
                                </div>
                                <div class="form-group">
                                    <label for="defaultTemplate">Default Template</label>
                                    <select id="defaultTemplate" class="input"></select>
                                </div>
                                <div class="form-group">
                                    <label for="preferredCreativity">Default Creativity Level</label>
                                    <input type="range" id="preferredCreativity" min="1" max="10" class="slider">
                                </div>
                                <button type="submit" class="button button-primary">Save Preferences</button>
                            </form>
                        </div>
                        <div class="tab-pane" id="history">
                            <div class="history-list"></div>
                        </div>
                        <div class="tab-pane" id="templates">
                            <button class="button button-primary" id="newTemplateBtn">Create New Template</button>
                            <div class="custom-templates-list"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Modal controls
        document.querySelector('#settingsModal .close-button').addEventListener('click', () => {
            this.hideModal();
        });

        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Preferences form
        document.getElementById('preferencesForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePreferences();
        });

        // New template button
        document.getElementById('newTemplateBtn').addEventListener('click', () => {
            this.showTemplateForm();
        });
    }

    async loadPreferences() {
        try {
            const response = await fetch('/api/preferences');
            const data = await response.json();
            
            if (data.status === 'success') {
                this.preferences = data.preferences;
                this.updatePreferencesForm();
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    async loadHistory() {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            
            if (data.status === 'success') {
                this.history = data.history;
                this.updateHistoryList();
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    async loadCustomTemplates() {
        try {
            const response = await fetch('/api/templates/custom');
            const data = await response.json();
            
            if (data.status === 'success') {
                this.customTemplates = data.templates;
                this.updateTemplatesList();
            }
        } catch (error) {
            console.error('Error loading custom templates:', error);
        }
    }

    async savePreferences() {
        const formData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            defaultTemplate: document.getElementById('defaultTemplate').value,
            preferredCreativity: document.getElementById('preferredCreativity').value
        };

        try {
            const response = await fetch('/api/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                this.showSuccess('Preferences saved successfully');
                this.preferences = formData;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            this.showError('Failed to save preferences');
        }
    }

    updatePreferencesForm() {
        if (!this.preferences) return;

        document.getElementById('userName').value = this.preferences.name || '';
        document.getElementById('userEmail').value = this.preferences.email || '';
        document.getElementById('defaultTemplate').value = this.preferences.defaultTemplate || 'modern';
        document.getElementById('preferredCreativity').value = this.preferences.preferredCreativity || 5;
    }

    updateHistoryList() {
        const historyList = document.querySelector('.history-list');
        historyList.innerHTML = this.history.map(item => `
            <div class="history-item card">
                <div class="history-item-header">
                    <h3>${item.position} at ${item.company}</h3>
                    <span class="date">${new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div class="history-item-preview">${item.content.substring(0, 200)}...</div>
                <button class="button" onclick="settingsManager.loadHistoryItem(${item.id})">
                    Load This Letter
                </button>
            </div>
        `).join('');
    }

    updateTemplatesList() {
        const templatesList = document.querySelector('.custom-templates-list');
        templatesList.innerHTML = this.customTemplates.map(template => `
            <div class="template-item card">
                <div class="template-item-header">
                    <h3>${template.name}</h3>
                    <span class="date">${new Date(template.created_at).toLocaleDateString()}</span>
                </div>
                <p class="template-description">${template.description || 'No description'}</p>
                <div class="template-actions">
                    <button class="button" onclick="settingsManager.editTemplate(${template.id})">
                        Edit
                    </button>
                    <button class="button button-danger" onclick="settingsManager.deleteTemplate(${template.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    showModal() {
        document.getElementById('settingsModal').classList.add('show');
        this.loadPreferences();
        this.loadHistory();
        this.loadCustomTemplates();
    }

    hideModal() {
        document.getElementById('settingsModal').classList.remove('show');
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });
        
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tabId);
        });
    }

    showTemplateForm(template = null) {
        const formHtml = `
            <div class="template-form">
                <h3>${template ? 'Edit Template' : 'Create New Template'}</h3>
                <form id="templateForm">
                    <div class="form-group">
                        <label for="templateName">Template Name</label>
                        <input type="text" id="templateName" class="input" value="${template?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="templateDescription">Description</label>
                        <textarea id="templateDescription" class="input" rows="3">${template?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="templateStructure">Structure</label>
                        <textarea id="templateStructure" class="input" rows="10" required>${template?.structure || ''}</textarea>
                    </div>
                    <button type="submit" class="button button-primary">
                        ${template ? 'Update Template' : 'Create Template'}
                    </button>
                </form>
            </div>
        `;

        const container = document.querySelector('.custom-templates-list');
        container.innerHTML = formHtml;

        document.getElementById('templateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveTemplate(template?.id);
        });
    }

    async saveTemplate(templateId = null) {
        const formData = {
            name: document.getElementById('templateName').value,
            description: document.getElementById('templateDescription').value,
            structure: document.getElementById('templateStructure').value
        };

        try {
            const response = await fetch('/api/templates/custom', {
                method: templateId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateId ? { ...formData, id: templateId } : formData)
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                this.showSuccess('Template saved successfully');
                await this.loadCustomTemplates();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            this.showError('Failed to save template');
        }
    }

    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
}

// Initialize settings manager
export const settingsManager = new SettingsManager();
