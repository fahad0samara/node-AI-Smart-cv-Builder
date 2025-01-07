import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GoogleGenerativeAI } = require('@google/generative-ai');

export { GoogleGenerativeAI };
