const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'writify.db'));

// Initialize database tables
db.serialize(() => {
    // Cover letter history
    db.run(`CREATE TABLE IF NOT EXISTS cover_letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        content TEXT NOT NULL,
        template_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Saved templates
    db.run(`CREATE TABLE IF NOT EXISTS custom_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        structure TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User preferences
    db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        default_template TEXT,
        preferred_creativity INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Cover letter operations
const saveCoverLetter = (data) => {
    return new Promise((resolve, reject) => {
        const { company, position, content, templateId } = data;
        db.run(
            'INSERT INTO cover_letters (company, position, content, template_id) VALUES (?, ?, ?, ?)',
            [company, position, content, templateId],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

const getCoverLetterHistory = () => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM cover_letters ORDER BY created_at DESC LIMIT 10',
            [],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
};

// Template operations
const saveCustomTemplate = (data) => {
    return new Promise((resolve, reject) => {
        const { name, description, structure } = data;
        db.run(
            'INSERT INTO custom_templates (name, description, structure) VALUES (?, ?, ?)',
            [name, description, structure],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

const getCustomTemplates = () => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM custom_templates ORDER BY created_at DESC',
            [],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
};

// User preferences operations
const saveUserPreferences = (data) => {
    return new Promise((resolve, reject) => {
        const { name, email, defaultTemplate, preferredCreativity } = data;
        db.run(
            'INSERT OR REPLACE INTO user_preferences (name, email, default_template, preferred_creativity) VALUES (?, ?, ?, ?)',
            [name, email, defaultTemplate, preferredCreativity],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

const getUserPreferences = () => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM user_preferences ORDER BY created_at DESC LIMIT 1',
            [],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
};

module.exports = {
    saveCoverLetter,
    getCoverLetterHistory,
    saveCustomTemplate,
    getCustomTemplates,
    saveUserPreferences,
    getUserPreferences
};
