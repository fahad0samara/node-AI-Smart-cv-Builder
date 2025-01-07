# 🚀 Writify AI - Smart Resume Builder

<div align="center">

![Writify AI Logo](https://img.shields.io/badge/Writify-AI-blue?style=for-the-badge)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

</div>

## 📋 Table of Contents
- [Overview](#overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📥 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [🎯 Usage](#-usage)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## Overview

Writify AI is a cutting-edge web application that revolutionizes the way you create professional CVs and cover letters. Powered by Google's Generative AI, it provides intelligent suggestions and improvements to help you craft the perfect resume.

## ✨ Features

### 🤖 AI-Powered Features
- **Smart Content Suggestions** - Get AI-powered recommendations for your resume content
- **Real-time Improvements** - Receive instant feedback and enhancement suggestions
- **Professional Tone Analysis** - Ensure your content maintains a professional tone

### 📝 Resume Building
- **Multiple Templates** - Choose from a variety of modern, professional templates
- **Real-time Preview** - See changes as you make them
- **Custom Sections** - Add, remove, and rearrange sections as needed
- **PDF Export** - Generate high-quality PDF documents

### 📋 Cover Letter Features
- **AI Writing Assistance** - Get help crafting the perfect cover letter
- **Template Matching** - Match your cover letter style with your CV
- **Customization Options** - Tailor your letter for different job applications

### 💾 Data Management
- **Secure Storage** - Save your progress and manage multiple versions
- **Easy Updates** - Quick updates and modifications
- **Profile Management** - Manage multiple professional profiles

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite
- **AI Integration:** Google Generative AI
- **PDF Processing:** Custom PDF generation engine

### Frontend
- **HTML5/CSS3** - Modern, responsive design
- **JavaScript** - Dynamic user interface
- **Custom UI Components** - Tailored resume building elements

### Key Dependencies
```json
{
  "express": "^4.18.2",
  "body-parser": "^1.20.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "multer": "^1.4.5-lts.1",
  "@google/generative-ai": "^0.1.3"
}
```

## 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fahad0samara/node-AI-Smart-cv-Builder.git
   cd node-AI-Smart-cv-Builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Create a `.env` file in the root directory
   - Add your Google AI API key:
     ```env
     GOOGLE_API_KEY=your_api_key
     ```

4. **Database setup**
   - The SQLite database will be automatically initialized on first run

## 🚀 Quick Start

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Start for production**
   ```bash
   npm start
   ```

Access the application at `http://localhost:3000`

## 📁 Project Structure
```
├── server.js           # Main application entry point
├── database.js         # Database configuration and models
├── gemini-service.js   # Google AI integration
├── resume-builder.js   # Resume generation logic
├── pdf-generator.js    # PDF creation service
├── templates.js        # Resume templates
├── writify.js         # Core application logic
└── writify-style.css  # Application styling
```

## 🔧 Configuration

### Environment Variables
- `GOOGLE_API_KEY`: Your Google Generative AI API key
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Customization
- Modify templates in `templates.js`
- Adjust styling in `writify-style.css`
- Configure AI settings in `gemini-service.js`

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ by Fahad
</div>
