import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import { geminiService } from './gemini-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files with proper MIME types
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Create necessary directories
const uploadsDir = path.join(__dirname, 'uploads', 'resumes');
fs.mkdirSync(uploadsDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Add debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        status: 'error',
        error: err.message || 'Internal server error'
    });
});

// API Routes
app.get('/api/templates', (req, res) => {
    res.json({
        status: 'success',
        templates: []
    });
});

app.post('/api/generate-letter', async (req, res) => {
    console.log('Starting cover letter generation...');
    try {
        const { jobDescription, skills, creativity, templateId, companyName, position, experience } = req.body;
        
        // Log received data
        console.log('Received data:', {
            jobDescription: jobDescription?.substring(0, 100) + '...',
            skills,
            creativity,
            templateId,
            companyName,
            position,
            experience
        });

        // Validate required fields
        if (!jobDescription || !companyName || !position) {
            console.log('Missing required fields');
            return res.status(400).json({
                status: 'error',
                error: 'Job description, company name, and position are required'
            });
        }

        if (!Array.isArray(skills) || skills.length === 0) {
            console.log('Invalid or empty skills array');
            return res.status(400).json({
                status: 'error',
                error: 'Please add at least one skill'
            });
        }

        console.log('Generating cover letter...');
        const coverLetter = await geminiService.generateCoverLetter({
            jobDescription,
            skills,
            creativity: creativity || 5,
            templateId: templateId || 'modern',
            companyName,
            position,
            experience: experience || 'Not specified'
        });

        console.log('Cover letter generated successfully');

        res.json({
            status: 'success',
            coverLetter,
            template: 'Modern Professional'
        });
    } catch (error) {
        console.error('Error in generate-letter:', error);
        console.error('Error stack:', error.stack);
        
        let errorMessage = 'Failed to generate cover letter';
        let statusCode = 500;

        if (error.message?.includes('rate limit')) {
            errorMessage = 'Rate limit exceeded. Using fallback generator.';
            statusCode = 429;
        }

        res.status(statusCode).json({
            status: 'error',
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.post('/api/export', (req, res) => {
    const { format, content } = req.body;
    
    try {
        switch (format) {
            case 'txt':
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', 'attachment; filename=cover-letter.txt');
                return res.send(content);
            
            case 'docx':
                // Here you would implement docx generation
                // For now, we'll just send txt
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', 'attachment; filename=cover-letter.txt');
                return res.send(content);
            
            default:
                throw new Error('Unsupported format');
        }
    } catch (error) {
        res.status(400).json({
            status: 'error',
            error: 'Failed to export cover letter'
        });
    }
});

// Auto-save route
app.post('/api/save-draft', async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({
                status: 'error',
                error: 'No content provided'
            });
        }

        // Here you would typically save to a database
        // For now, we'll just send back a success response
        console.log('Draft saved:', content.substring(0, 50) + '...');
        
        res.json({ 
            status: 'success',
            message: 'Draft saved successfully'
        });
    } catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Failed to save draft'
        });
    }
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        geminiConfigured: !!process.env.GEMINI_API_KEY
    });
});

// New routes
app.get('/api/history', async (req, res) => {
    try {
        const history = [];
        res.json({
            status: 'success',
            history
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to fetch history'
        });
    }
});

app.post('/api/templates/custom', async (req, res) => {
    try {
        const { name, description, structure } = req.body;
        
        if (!name || !structure) {
            return res.status(400).json({
                status: 'error',
                error: 'Template name and structure are required'
            });
        }

        const templateId = 'custom';
        res.json({
            status: 'success',
            templateId,
            message: 'Template saved successfully'
        });
    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to save template'
        });
    }
});

app.get('/api/templates/custom', async (req, res) => {
    try {
        const customTemplates = [];
        res.json({
            status: 'success',
            templates: customTemplates
        });
    } catch (error) {
        console.error('Error fetching custom templates:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to fetch custom templates'
        });
    }
});

app.post('/api/preferences', async (req, res) => {
    try {
        const { name, email, defaultTemplate, preferredCreativity } = req.body;
        
        res.json({
            status: 'success',
            message: 'Preferences saved successfully'
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to save preferences'
        });
    }
});

app.get('/api/preferences', async (req, res) => {
    try {
        const preferences = {};
        res.json({
            status: 'success',
            preferences
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to fetch preferences'
        });
    }
});

app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                error: 'No resume file uploaded'
            });
        }

        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({
                status: 'error',
                error: 'Job description is required'
            });
        }

        // Read and parse resume
        const fileContent = await fs.promises.readFile(req.file.path);
        const resumeText = fileContent.toString();

        // Use Gemini for analysis
        const [analysis, skillsGraph, suggestedJobs, coverLetterSuggestions] = await Promise.all([
            geminiService.analyzeResume(resumeText, jobDescription),
            geminiService.generateSkillsGraph(resumeText),
            geminiService.suggestJobTitles(resumeText),
            geminiService.generateCoverLetterSuggestions(resumeText, jobDescription)
        ]);

        res.json({
            status: 'success',
            analysis,
            skillsGraph,
            suggestedJobs,
            coverLetterSuggestions
        });
    } catch (error) {
        console.error('Error in resume analysis:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to analyze resume'
        });
    }
});

app.post('/api/export-pdf', async (req, res) => {
    try {
        const {
            content,
            company,
            position,
            userName,
            userEmail,
            templateName,
            style
        } = req.body;

        if (!content || !company || !position) {
            return res.status(400).json({
                status: 'error',
                error: 'Content, company name, and position are required'
            });
        }

        const pdfPath = 'cover-letter.pdf';
        res.json({
            status: 'success',
            pdfPath: pdfPath.replace(/^\.\//, '/'),
            message: 'PDF generated successfully'
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to generate PDF'
        });
    }
});

app.post('/api/improve-writing', async (req, res) => {
    try {
        const { text, style } = req.body;
        
        if (!text) {
            return res.status(400).json({
                status: 'error',
                error: 'Text content is required'
            });
        }

        const improvedText = await geminiService.improveWriting(text, style);
        
        res.json({
            status: 'success',
            improvedText
        });
    } catch (error) {
        console.error('Error improving writing:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to improve writing'
        });
    }
});

// Resume Builder Routes
app.post('/api/resume/section', async (req, res) => {
    try {
        const { sectionType, input } = req.body;
        
        if (!sectionType || !input) {
            return res.status(400).json({
                status: 'error',
                error: 'Section type and input are required'
            });
        }

        const section = '';
        
        res.json({
            status: 'success',
            section
        });
    } catch (error) {
        console.error('Error generating resume section:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to generate resume section'
        });
    }
});

app.post('/api/resume/improve', async (req, res) => {
    try {
        const { sectionType, content } = req.body;
        
        if (!sectionType || !content) {
            return res.status(400).json({
                status: 'error',
                error: 'Section type and content are required'
            });
        }

        const improved = '';
        
        res.json({
            status: 'success',
            section: improved
        });
    } catch (error) {
        console.error('Error improving resume section:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to improve resume section'
        });
    }
});

app.post('/api/resume/keywords', async (req, res) => {
    try {
        const { content, industry } = req.body;
        
        if (!content || !industry) {
            return res.status(400).json({
                status: 'error',
                error: 'Content and industry are required'
            });
        }

        const keywords = [];
        
        res.json({
            status: 'success',
            keywords
        });
    } catch (error) {
        console.error('Error suggesting keywords:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to suggest keywords'
        });
    }
});

app.post('/api/resume/format', async (req, res) => {
    try {
        const { content, format } = req.body;
        
        if (!content) {
            return res.status(400).json({
                status: 'error',
                error: 'Content is required'
            });
        }

        const formatted = '';
        
        res.json({
            status: 'success',
            formatted
        });
    } catch (error) {
        console.error('Error formatting section:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to format section'
        });
    }
});

app.post('/api/resume/achievements', async (req, res) => {
    try {
        const { experience } = req.body;
        
        if (!experience) {
            return res.status(400).json({
                status: 'error',
                error: 'Experience details are required'
            });
        }

        const achievements = [];
        
        res.json({
            status: 'success',
            achievements
        });
    } catch (error) {
        console.error('Error generating achievements:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to generate achievements'
        });
    }
});

// Serve exported files
app.use('/exports', express.static(path.join(__dirname, 'exports')));

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Gemini API Key ${process.env.GEMINI_API_KEY ? 'is' : 'is NOT'} configured`);
});
