export class FallbackGenerator {
    constructor() {
        this.templates = {
            modern: {
                name: 'Modern Professional',
                template: `
Dear {hiring_manager},

I am writing to express my strong interest in the {position} position at {company}. With my background in {skills}, I am confident in my ability to contribute effectively to your team.

{job_match}

{skills_highlight}

{experience_highlight}

I am particularly drawn to {company} because {company_highlight}. I am excited about the possibility of bringing my skills and experience to your team.

Thank you for considering my application. I look forward to discussing how I can contribute to {company}'s continued success.

Best regards,
[Your Name]`
            },
            creative: {
                name: 'Creative',
                template: `
Dear {hiring_manager},

I was thrilled to discover the {position} opportunity at {company}. As a professional with expertise in {skills}, I see a perfect alignment between my capabilities and your needs.

{job_match}

{skills_highlight}

{experience_highlight}

What excites me most about {company} is {company_highlight}. I am eager to bring my creative approach and proven skills to your innovative team.

I would welcome the opportunity to discuss how my background and skills would benefit {company}.

Best regards,
[Your Name]`
            }
        };
    }

    generateParagraph(type, data) {
        switch (type) {
            case 'job_match':
                return `The position requirements align perfectly with my experience in ${data.skills.join(', ')}. I have a proven track record of ${this.getRandomAchievement(data.skills)}.`;
            
            case 'skills_highlight':
                return `My key strengths include:\n${data.skills.map(skill => `• ${skill}: ${this.getRandomSkillDescription(skill)}`).join('\n')}`;
            
            case 'experience_highlight':
                return `With ${data.experience || 'relevant'} experience, I have consistently ${this.getRandomExperienceHighlight()}.`;
            
            case 'company_highlight':
                return this.getRandomCompanyHighlight();
            
            default:
                return '';
        }
    }

    getRandomAchievement(skills) {
        const achievements = [
            `delivering successful projects using ${skills[0]}`,
            `improving team efficiency through ${skills[0]} implementation`,
            `solving complex problems using ${skills[0]}`,
            `leading initiatives in ${skills[0]}`
        ];
        return achievements[Math.floor(Math.random() * achievements.length)];
    }

    getRandomSkillDescription(skill) {
        const descriptions = [
            'demonstrated expertise in various projects',
            'proven track record of successful implementation',
            'strong foundation with practical application',
            'extensive experience in real-world scenarios'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    getRandomExperienceHighlight() {
        const highlights = [
            'demonstrated strong problem-solving abilities',
            'contributed to team success through innovative solutions',
            'exceeded performance expectations',
            'delivered high-quality results under tight deadlines'
        ];
        return highlights[Math.floor(Math.random() * highlights.length)];
    }

    getRandomCompanyHighlight() {
        const highlights = [
            'your commitment to innovation and excellence',
            'your industry-leading position and forward-thinking approach',
            'your reputation for fostering a collaborative and dynamic work environment',
            'your impressive track record of growth and success'
        ];
        return highlights[Math.floor(Math.random() * highlights.length)];
    }

    generateCoverLetter(params) {
        const { jobDescription, skills, templateId = 'modern', companyName, position, experience } = params;
        
        const template = this.templates[templateId] || this.templates.modern;
        const data = {
            skills,
            experience,
            jobDescription
        };

        let letter = template.template
            .replace('{hiring_manager}', 'Hiring Manager')
            .replace(/{position}/g, position)
            .replace(/{company}/g, companyName)
            .replace('{skills}', skills.slice(0, 3).join(', '))
            .replace('{job_match}', this.generateParagraph('job_match', data))
            .replace('{skills_highlight}', this.generateParagraph('skills_highlight', data))
            .replace('{experience_highlight}', this.generateParagraph('experience_highlight', data))
            .replace('{company_highlight}', this.generateParagraph('company_highlight', data));

        return letter.trim();
    }
}

export default new FallbackGenerator();
