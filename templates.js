const coverLetterTemplates = {
    modern: {
        name: "Modern Professional",
        description: "A contemporary and direct approach that emphasizes achievements",
        structure: `Dear Hiring Manager,

I am writing to express my sincere interest in [position] at [company]. With my background in [main skill] and proven track record in [secondary skill], I am confident in my ability to contribute significantly to your team.

[Experience and skills paragraph]

[Company-specific paragraph]

[Closing paragraph]

Best regards,
[Your name]`
    },
    creative: {
        name: "Creative & Dynamic",
        description: "A bold and innovative style for creative industries",
        structure: `Greetings [company] team!

When I discovered the [position] opportunity at [company], I knew it was the perfect chance to combine my passion for [industry] with my expertise in [main skill].

[Creative opening and hook]

[Skills and achievements]

[Vision and alignment]

Looking forward to discussing how my unique perspective can contribute to [company]'s continued success.

Best regards,
[Your name]`
    },
    technical: {
        name: "Technical Professional",
        description: "Focused on technical expertise and problem-solving abilities",
        structure: `Dear Hiring Manager,

I am writing to apply for the [position] position at [company]. As a professional with [years] years of experience in [technical field], I bring a robust combination of technical expertise and practical implementation experience.

[Technical skills and projects]

[Problem-solving examples]

[Technical alignment with company]

Thank you for considering my application.

Best regards,
[Your name]`
    }
};

module.exports = coverLetterTemplates;
