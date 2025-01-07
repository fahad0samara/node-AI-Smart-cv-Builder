const PDFDocument = require('pdfkit');
const fs = require('fs');

class PDFGenerator {
    constructor() {
        this.defaultStyles = {
            font: 'Helvetica',
            fontSize: 12,
            lineHeight: 1.5,
            margins: {
                top: 72,    // 1 inch
                bottom: 72,
                left: 72,
                right: 72
            },
            headerFont: 'Helvetica-Bold',
            headerSize: 14,
            dateFormat: new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
    }

    async generateCoverLetter(data, style = {}) {
        const {
            content,
            company,
            position,
            userName,
            userEmail,
            templateName,
            customHeader,
            customFooter
        } = data;

        const styles = { ...this.defaultStyles, ...style };
        const doc = new PDFDocument({
            margins: styles.margins,
            size: 'A4'
        });

        // Set up the PDF metadata
        doc.info.Title = `Cover Letter - ${position} at ${company}`;
        doc.info.Author = userName || 'Writify User';
        doc.info.CreationDate = new Date();

        // Create write stream
        const outputPath = `./exports/cover-letter-${company.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // Add header
        if (customHeader) {
            await this.addCustomHeader(doc, customHeader, styles);
        } else {
            this.addDefaultHeader(doc, data, styles);
        }

        // Add content
        doc.font(styles.font)
           .fontSize(styles.fontSize)
           .moveDown(2);

        // Format and add the cover letter content
        const paragraphs = content.split('\n\n');
        paragraphs.forEach(paragraph => {
            doc.text(paragraph.trim(), {
                align: 'justify',
                lineGap: styles.fontSize * (styles.lineHeight - 1)
            }).moveDown();
        });

        // Add footer
        if (customFooter) {
            await this.addCustomFooter(doc, customFooter, styles);
        } else {
            this.addDefaultFooter(doc, data, styles);
        }

        // Add page numbers
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            const pageNumber = `Page ${i + 1} of ${pages.count}`;
            doc.text(
                pageNumber,
                doc.page.margins.left,
                doc.page.height - doc.page.margins.bottom + 40,
                {
                    align: 'center',
                    width: doc.page.width - doc.page.margins.left - doc.page.margins.right
                }
            );
        }

        // Finalize the PDF
        doc.end();

        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => resolve(outputPath));
            writeStream.on('error', reject);
        });
    }

    addDefaultHeader(doc, data, styles) {
        const { userName, userEmail, company, position } = data;
        const date = styles.dateFormat.format(new Date());

        // Add user info
        doc.font(styles.headerFont)
           .fontSize(styles.headerSize)
           .text(userName || 'Applicant Name', { align: 'left' })
           .font(styles.font)
           .fontSize(styles.fontSize)
           .text(userEmail || 'applicant@email.com')
           .moveDown(2);

        // Add company info
        doc.text(company)
           .text(`Re: ${position} Position`)
           .text(date)
           .moveDown();
    }

    addDefaultFooter(doc, data, styles) {
        const { userName } = data;

        doc.moveDown(2)
           .font(styles.font)
           .fontSize(styles.fontSize)
           .text('Sincerely,', { align: 'left' })
           .moveDown()
           .text(userName || 'Applicant Name')
           .moveDown()
           .text(new Date().getFullYear(), { align: 'center', opacity: 0.5 });
    }

    async addCustomHeader(doc, headerPath, styles) {
        if (headerPath.endsWith('.png') || headerPath.endsWith('.jpg') || headerPath.endsWith('.jpeg')) {
            doc.image(headerPath, {
                fit: [doc.page.width - styles.margins.left - styles.margins.right, 100],
                align: 'center'
            });
        } else {
            const headerContent = await fs.promises.readFile(headerPath, 'utf8');
            doc.text(headerContent, {
                align: 'left'
            });
        }
    }

    async addCustomFooter(doc, footerPath, styles) {
        const pageBottom = doc.page.height - styles.margins.bottom;
        
        if (footerPath.endsWith('.png') || footerPath.endsWith('.jpg') || footerPath.endsWith('.jpeg')) {
            doc.image(footerPath, {
                fit: [doc.page.width - styles.margins.left - styles.margins.right, 50],
                align: 'center'
            });
        } else {
            const footerContent = await fs.promises.readFile(footerPath, 'utf8');
            doc.text(footerContent, {
                align: 'center'
            });
        }
    }

    getAvailableFonts() {
        return [
            'Helvetica',
            'Helvetica-Bold',
            'Helvetica-Oblique',
            'Helvetica-BoldOblique',
            'Times-Roman',
            'Times-Bold',
            'Times-Italic',
            'Times-BoldItalic',
            'Courier',
            'Courier-Bold',
            'Courier-Oblique',
            'Courier-BoldOblique'
        ];
    }
}

module.exports = new PDFGenerator();
