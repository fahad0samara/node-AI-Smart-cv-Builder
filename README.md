# Writify AI - Smart Resume Builder

A modern web application for creating professional CVs and cover letters, powered by AI assistance.

## Features

- Interactive CV builder with modern templates
- AI-powered content suggestions using Google's Generative AI
- PDF generation for both CVs and cover letters
- Resume analysis and improvement suggestions
- Multiple template options
- Real-time preview
- Database storage for saving drafts

## Tech Stack

- **Backend:**
  - Node.js with Express
  - SQLite database
  - Google Generative AI integration
  - PDF generation capabilities

- **Frontend:**
  - HTML5/CSS3
  - Modern JavaScript
  - Responsive design

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```
GOOGLE_API_KEY=your_api_key
```

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Usage

Access the application at `http://localhost:3000` after starting the server.

## Dependencies

- express: ^4.18.2
- body-parser: ^1.20.2
- dotenv: ^16.3.1
- cors: ^2.8.5
- multer: ^1.4.5-lts.1
- @google/generative-ai: ^0.1.3

## Project Structure

- `server.js` - Main entry point
- `gemini-service.js` - AI integration
- `database.js` - Database operations
- `resume-builder.js` - CV generation logic
- `pdf-generator.js` - PDF creation
- Frontend assets in root directory

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License
