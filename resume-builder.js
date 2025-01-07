const geminiService = require('./gemini-service');

class ResumeBuilder {
    constructor() {
        this.sections = {
            summary: {
                title: 'Professional Summary',
                prompt: 'Write a compelling professional summary highlighting key achievements and expertise'
            },
            experience: {
                title: 'Work Experience',
                prompt: 'Format work experience with achievements and measurable results'
            },
            education: {
                title: 'Education',
                prompt: 'Format education details professionally'
            },
            skills: {
                title: 'Skills',
                prompt: 'Organize and categorize skills effectively'
            },
            projects: {
                title: 'Projects',
                prompt: 'Highlight key projects with technologies and outcomes'
            }
        };
    }

    async generateSection(sectionType, input) {
        const section = this.sections[sectionType];
        if (!section) {
            throw new Error('Invalid section type');
        }

        const prompt = `${section.prompt} for a resume. Format it professionally.
        
        Input information:
        ${input}
        
        Requirements:
        1. Use strong action verbs
        2. Include measurable results where possible
        3. Be concise but impactful
        4. Focus on achievements over responsibilities
        5. Use industry-standard terminology`;

        try {
            const result = await geminiService.model.generateContent(prompt);
            return {
                title: section.title,
                content: result.response.text()
            };
        } catch (error) {
            console.error(`Error generating ${sectionType} section:`, error);
            throw new Error(`Failed to generate ${sectionType} section`);
        }
    }

    async improveSection(sectionType, content) {
        const section = this.sections[sectionType];
        if (!section) {
            throw new Error('Invalid section type');
        }

        const prompt = `Improve this ${section.title} section of a resume:

        ${content}

        Make it:
        1. More impactful and achievement-focused
        2. Quantifiable where possible
        3. Clearer and more concise
        4. Industry-optimized
        5. ATS-friendly`;

        try {
            const result = await geminiService.model.generateContent(prompt);
            return {
                title: section.title,
                content: result.response.text()
            };
        } catch (error) {
            console.error(`Error improving ${sectionType} section:`, error);
            throw new Error(`Failed to improve ${sectionType} section`);
        }
    }

    async suggestKeywords(content, industry) {
        const prompt = `Extract and suggest relevant keywords for this resume content in the ${industry} industry:

        ${content}

        Provide:
        1. Technical skills keywords
        2. Soft skills keywords
        3. Industry-specific terminology
        4. Action verbs
        5. Certification keywords`;

        try {
            const result = await geminiService.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error suggesting keywords:', error);
            throw new Error('Failed to suggest keywords');
        }
    }

    async formatSection(content, format = 'modern') {
        const formatStyles = {
            modern: 'Clean, minimalist style with clear hierarchy',
            traditional: 'Classic format with standard bullet points',
            creative: 'Unique layout with visual emphasis',
            executive: 'Sophisticated style emphasizing leadership'
        };

        const prompt = `Format this resume section in a ${format} style:

        ${content}

        Style notes: ${formatStyles[format] || formatStyles.modern}

        Requirements:
        1. Maintain professional formatting
        2. Use consistent spacing and structure
        3. Emphasize key information
        4. Make it easily scannable
        5. Keep it ATS-friendly`;

        try {
            const result = await geminiService.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error formatting section:', error);
            throw new Error('Failed to format section');
        }
    }

    async generateAchievements(experience) {
        const prompt = `Transform these job responsibilities into achievement statements:

        ${experience}

        Requirements:
        1. Use the STAR method (Situation, Task, Action, Result)
        2. Include measurable results and metrics
        3. Highlight impact and value added
        4. Use strong action verbs
        5. Be specific and concrete`;

        try {
            const result = await geminiService.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error generating achievements:', error);
            throw new Error('Failed to generate achievements');
        }
    }
}

module.exports = new ResumeBuilder();
