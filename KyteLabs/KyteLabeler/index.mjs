import express, { json, urlencoded } from 'express';
import axios from 'axios';
import xml2js from 'xml2js';
import bwipjs from 'bwip-js';
import PDFDocument from 'pdfkit';
import cors from 'cors';

const app = express();
const port = 3000;

// Convert dimensions to points (1 inch = 72 points)
const labelSizes = {
    '1x2': { width: 144, height: 72 }, // 1" x 2"
    '1.5x1': { width: 108, height: 72 }, // 1.5" x 1"
    '2x1': { width: 144, height: 72 }, // 2" x 1"
    '3x1': { width: 216, height: 72 }, // 3" x 1"
    '4x6': { width: 288, height: 432 }, // 4" x 6"
    '2x4': { width: 144, height: 288 } // 2" x 4"
};
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

function transformUrl(baseUrl) {
    // Check if baseUrl starts with http:// or https://, if not, prepend http://
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = 'http://' + baseUrl;
    }

    const url = new URL(baseUrl);
    url.hostname = url.hostname.split('.').shift() + '.stage.kyte.site';
    url.pathname = '/feed/';
    return url.toString();
}

async function layoutLabels(doc, gtins, labelSize) {
    const topMargin = 36; // Example top margin in points (0.5 inch)
    const leftMargin = 13.5; // Example left margin in points (0.188 inch)
    const horizontalSpacing = 9; // Example horizontal spacing in points (0.125 inch)
    const verticalSpacing = 0; // Example vertical spacing in points (0 inch)
    const pageWidth = 612; // Letter size width in points (8.5 inch)
    const pageHeight = 792; // Letter size height in points (11 inch)

    let x = leftMargin;
    let y = topMargin;

    for (const gtin of gtins) {
        // Check if we need to move to the next row
        if (x + labelSize.width > pageWidth - leftMargin) {
            x = leftMargin;
            y += labelSize.height + verticalSpacing;
        }

        // Check if we need to add a new page
        if (y + labelSize.height > pageHeight - topMargin) {
            doc.addPage();
            y = topMargin; // Reset Y to top margin on new page
        }

        // Generate the barcode for this GTIN
        const barcode = await bwipjs.toBuffer({
            bcid: 'code128', // Barcode type
            text: gtin, // The text to encode
            scale: 1, // Adjust the scale as necessary
            height: 10, // Adjust barcode height to be narrower
            includetext: true, // Include text below barcode
            textxalign: 'center', // Text alignment
            textsize: 8, // Adjust text size as necessary
        });

        // Place the barcode image on the PDF
        doc.image(barcode, x, y, { fit: [labelSize.width, labelSize.height] });

        // Move to the next label position
        x += labelSize.width + horizontalSpacing;
    }
}

// Endpoint to process XML URL and generate PDF
// Endpoint to process XML URL and generate PDF
app.post('/generate-barcodes', async (req, res) => {
    try {
        const xmlUrl = req.body.xmlUrl; // Get xmlUrl from the request body
        const transformedUrl = transformUrl(xmlUrl); // Transform the URL
        const selectedSize = req.body.size || '1x2'; // Default size if not provided
        const labelSize = labelSizes[selectedSize]; // Get the label size from labelSizes object
        const xmlData = (await axios.get(transformedUrl)).data;

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const items = result.rss.channel[0].item;
        // Extract GTINs from items
        const gtins = items.map(item => item['g:gtin'] ? item['g:gtin'][0] : null).filter(gtin => gtin !== null);

        // Create a new PDF document
        const doc = new PDFDocument({ size: 'LETTER' });
        const pdfBuffer = [];

        doc.on('data', data => pdfBuffer.push(data));
        doc.on('end', () => {
            const pdfData = Buffer.concat(pdfBuffer);
            res.writeHead(200, {
                'Content-Length': Buffer.byteLength(pdfData),
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment;filename=barcodes.pdf',
            }).end(pdfData);
        });

        // Layout and add barcodes to the PDF
        await layoutLabels(doc, gtins, labelSize);

        doc.end();
    } catch (error) {
        console.error('Error detail:', error);
        res.status(500).send('Error processing request');
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
