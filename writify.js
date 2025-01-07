import { geminiService } from './gemini-service.js';

class WritifyApp {
    constructor() {
        this.form = document.getElementById('coverLetterForm');
        this.jobDescription = document.querySelector('textarea');
        this.skillsContainer = document.querySelector('.tags');
        this.creativitySlider = document.querySelector('input[type="range"]');
        this.templateSelect = document.getElementById('template');
        this.companyInput = document.getElementById('company');
        this.positionInput = document.getElementById('position');
        this.experienceInput = document.getElementById('experience');
        this.autoSaveTimeout = null;
        this.lastSavedContent = '';
        this.generatedLetter = '';
        this.lastRequestTime = 0;
        this.MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests
        this.isGenerating = false;
        
        this.initializeEventListeners();
        this.loadTemplates();
    }

    initializeEventListeners() {
        // Form submission
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Auto-save
        this.jobDescription.addEventListener('input', this.handleAutoSave.bind(this));
        
        // Skills tags
        const tagInput = document.querySelector('.tag-input');
        tagInput.addEventListener('keydown', this.handleTagInput.bind(this));
        
        // Remove tags
        this.skillsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                e.target.parentElement.remove();
                this.updateProgress();
            }
        });

        // Creativity slider
        this.creativitySlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.querySelector('.slider-value').textContent = value;
            this.updateProgress();
        });

        // Copy to clipboard functionality
        const copyButton = document.getElementById('copyButton');
        if (copyButton) {
            copyButton.addEventListener('click', async () => {
                try {
                    const content = document.getElementById('coverLetterResult').textContent;
                    await navigator.clipboard.writeText(content);
                    this.showNotification('Cover letter copied to clipboard!', 'success');
                } catch (err) {
                    this.showNotification('Failed to copy to clipboard', 'error');
                }
            });
        }

        // Download as DOCX
        const downloadDocxButton = document.getElementById('downloadDocxButton');
        if (downloadDocxButton) {
            downloadDocxButton.addEventListener('click', () => {
                const content = document.getElementById('coverLetterResult').textContent;
                const name = document.getElementById('name')?.value || 'Cover_Letter';
                const filename = `${name.replace(/\s+/g, '_')}_Cover_Letter.docx`;
                
                // Here you would typically use a library like docx.js to create a proper DOCX file
                this.showNotification('DOCX download feature coming soon!', 'info');
            });
        }
    }

    async loadTemplates() {
        try {
            const response = await fetch('/api/templates');
            const data = await response.json();
            
            if (data.status === 'success') {
                this.templateSelect.innerHTML = data.templates.map(template => `
                    <option value="${template.id}">${template.name}</option>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isGenerating) {
            this.showNotification('Please wait for the current generation to complete.', 'warning');
            return;
        }
        
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            const waitTime = Math.ceil((this.MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
            this.showNotification(`Please wait ${waitTime} seconds before generating another cover letter.`, 'warning');
            return;
        }

        const jobDescription = this.jobDescription.value.trim();
        const skills = this.getSelectedSkills();
        const company = this.companyInput.value.trim();
        const position = this.positionInput.value.trim();

        if (!jobDescription) {
            this.showNotification('Please enter a job description', 'error');
            return;
        }

        if (!company) {
            this.showNotification('Please enter a company name', 'error');
            return;
        }

        if (!position) {
            this.showNotification('Please enter a position', 'error');
            return;
        }

        if (skills.length === 0) {
            this.showNotification('Please add at least one skill', 'error');
            return;
        }
        
        try {
            this.isGenerating = true;
            const originalContent = this.showLoadingState();
            
            const response = await fetch('/api/generate-letter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobDescription,
                    skills,
                    creativity: this.creativitySlider.value,
                    templateId: this.templateSelect.value,
                    companyName: company,
                    position,
                    experience: this.experienceInput.value,
                    saveToHistory: true
                })
            });

            this.lastRequestTime = Date.now();
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                this.generatedLetter = data.coverLetter;
                this.updateCoverLetterPreview(data.coverLetter);
                this.showNotification('Cover letter generated successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to generate cover letter');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.isGenerating = false;
            this.hideLoadingState(originalContent);
        }
    }

    async handleAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        
        const currentContent = this.jobDescription.value.trim();
        if (!currentContent || currentContent === this.lastSavedContent) {
            return;
        }
        
        this.showSavingIndicator();
        
        this.autoSaveTimeout = setTimeout(async () => {
            try {
                const response = await fetch('/api/save-draft', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: currentContent
                    })
                });

                const data = await response.json();
                
                if (data.status === 'success') {
                    this.lastSavedContent = currentContent;
                    this.showSavedIndicator();
                } else {
                    throw new Error(data.error || 'Failed to save');
                }
            } catch (error) {
                console.error('Auto-save error:', error);
                this.showNotification('Failed to auto-save', 'error');
            }
        }, 1000);

        this.updateProgress();
    }

    handleTagInput(e) {
        if (e.key === 'Enter' && e.target.value.trim()) {
            this.addTag(e.target.value.trim());
            e.target.value = '';
            this.updateProgress();
        }
    }

    addTag(text) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${text} <span class="close">×</span>`;
        this.skillsContainer.appendChild(tag);
    }

    async exportLetter(format) {
        if (!this.generatedLetter) {
            this.showNotification('Please generate a cover letter first', 'error');
            return;
        }

        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format,
                    content: this.generatedLetter
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cover-letter.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                this.showNotification('Cover letter exported successfully!', 'success');
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            this.showNotification('Failed to export cover letter', 'error');
        }
    }

    async shareLetter() {
        if (!this.generatedLetter) {
            this.showNotification('Please generate a cover letter first', 'error');
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Cover Letter',
                    text: this.generatedLetter
                });
                this.showNotification('Cover letter shared successfully', 'success');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.showNotification('Failed to share cover letter', 'error');
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(this.generatedLetter);
                this.showNotification('Cover letter copied to clipboard', 'success');
            } catch (error) {
                this.showNotification('Failed to copy to clipboard', 'error');
            }
        }
    }

    updateCoverLetterPreview(response) {
        const resultSection = document.querySelector('.result-section');
        const coverLetterResult = document.getElementById('coverLetterResult');
        const applicantName = document.getElementById('applicantName');
        const applicantPosition = document.getElementById('applicantPosition');
        const companyName = document.getElementById('companyName');
        const currentDate = document.getElementById('currentDate');
        const signatureName = document.getElementById('signatureName');

        // Get form values
        const name = document.getElementById('name')?.value || '';
        const position = this.positionInput.value;
        const company = this.companyInput.value;

        // Update preview sections
        if (applicantName) applicantName.textContent = name;
        if (applicantPosition) applicantPosition.textContent = position;
        if (companyName) companyName.textContent = company;
        if (signatureName) signatureName.textContent = name;
        
        // Set current date
        if (currentDate) {
            const date = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            currentDate.textContent = date.toLocaleDateString('en-US', options);
        }

        // Set cover letter content
        if (coverLetterResult) {
            coverLetterResult.textContent = response;
        }
        
        // Show result section with fade-in animation
        if (resultSection) {
            resultSection.style.display = 'block';
            resultSection.style.opacity = '0';
            setTimeout(() => {
                resultSection.style.transition = 'opacity 0.3s ease-in-out';
                resultSection.style.opacity = '1';
            }, 10);
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // UI Helper Methods
    showLoadingState() {
        const button = this.form.querySelector('button[type="submit"]');
        const originalContent = button.innerHTML;
        button.innerHTML = '<span class="loader"></span> Generating...';
        button.disabled = true;
        return originalContent;
    }

    hideLoadingState(originalContent) {
        const button = this.form.querySelector('button[type="submit"]');
        button.innerHTML = originalContent;
        button.disabled = false;
    }

    showSavingIndicator() {
        const indicator = document.querySelector('.auto-save');
        if (indicator) {
            indicator.innerHTML = `
                <svg class="spinner" width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                saving...
            `;
        }
    }

    showSavedIndicator() {
        const indicator = document.querySelector('.auto-save');
        if (indicator) {
            indicator.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#10B981" stroke-width="2"/>
                    <path d="M5 8l2 2 4-4" stroke="#10B981" stroke-width="2"/>
                </svg>
                auto saved
            `;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';

            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
    }

    updateProgress() {
        const progress = document.querySelector('.progress-bar');
        const score = document.querySelector('.score');
        
        if (progress && score) {
            const fields = {
                description: this.jobDescription.value.length > 50,
                skills: this.getSelectedSkills().length > 0,
                creativity: true
            };
            
            const percentage = (Object.values(fields).filter(Boolean).length / Object.keys(fields).length) * 100;
            progress.style.width = `${percentage}%`;
            score.textContent = `${Math.round(percentage/10)}/10`;
        }
    }

    getSelectedSkills() {
        return Array.from(this.skillsContainer.querySelectorAll('.tag'))
            .map(tag => tag.textContent.replace('×', '').trim());
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WritifyApp();
});
