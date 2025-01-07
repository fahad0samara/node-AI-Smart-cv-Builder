const OpenAI = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');

class ResumeAnalyzer {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Configure multer for file uploads
        this.upload = multer({
            storage: multer.diskStorage({
                destination: './uploads/resumes',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
                }
            }),
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
                const ext = path.extname(file.originalname).toLowerCase();
                if (allowedTypes.includes(ext)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
                }
            },
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB limit
            }
        });
    }

    async analyzeResume(filePath, jobDescription) {
        try {
            // Read and parse the resume
            const fileContent = await fs.readFile(filePath);
            const data = await pdf(fileContent);
            const resumeText = data.text;

            // Analyze resume with OpenAI
            const analysis = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert resume analyzer and career counselor. Analyze the resume and job description provided, then give detailed feedback and suggestions.`
                    },
                    {
                        role: "user",
                        content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nPlease provide:
                        1. Match percentage between resume and job requirements
                        2. List of matching skills
                        3. List of missing skills
                        4. Suggestions for resume improvements
                        5. Key strengths relevant to the position
                        6. Areas for development
                        7. Recommended certifications or training`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            });

            return {
                status: 'success',
                analysis: analysis.choices[0].message.content,
                resumeText
            };
        } catch (error) {
            console.error('Error analyzing resume:', error);
            throw new Error('Failed to analyze resume');
        }
    }

    async generateSkillsGraph(resumeText) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Extract and categorize skills from the resume into technical skills, soft skills, and domain knowledge. Return the result as a JSON object."
                    },
                    {
                        role: "user",
                        content: resumeText
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error generating skills graph:', error);
            throw new Error('Failed to generate skills graph');
        }
    }

    async suggestJobTitles(resumeText) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Based on the resume content, suggest relevant job titles and career paths. Include both lateral moves and potential career advancement options."
                    },
                    {
                        role: "user",
                        content: resumeText
                    }
                ],
                temperature: 0.7,
                max_tokens: 300
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error suggesting job titles:', error);
            throw new Error('Failed to suggest job titles');
        }
    }

    async generateCoverLetterSuggestions(resumeText, jobDescription) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Analyze the resume and job description to suggest key points and achievements that should be highlighted in the cover letter."
                    },
                    {
                        role: "user",
                        content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error generating cover letter suggestions:', error);
            throw new Error('Failed to generate cover letter suggestions');
        }
    }

    getMiddleware() {
        return this.upload.single('resume');
    }
}

module.exports = new ResumeAnalyzer();
