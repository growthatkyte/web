import express, { json, urlencoded } from 'express';
import axios from 'axios';
import xml2js from 'xml2js';
import bwipjs from 'bwip-js';
import PDFDocument from 'pdfkit';
import cors from 'cors';

const app = express();
const port = 3000;

const labelSizes = {
    '1x2': { width: 50, height: 25 }, // 1" x 2"
    '1.5x1': { width: 38, height: 25 }, // 1.5" x 1"
    '2x1': { width: 50, height: 25 }, // 2" x 1"
    '3x1': { width: 76, height: 25 }, // 3" x 1"
    '4x6': { width: 101, height: 152 }, // 4" x 6"
    '2x4': { width: 50, height: 101 } // 2" x 4"
};
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Endpoint to process XML URL and generate PDF
app.post('/generate-barcodes', async (req, res) => {
    try {
        const xmlUrl = req.body.xmlUrl;
        const selectedSize = req.body.size || '1x2'; // Default size if not provided
        const labelSize = labelSizes[selectedSize];
        const xmlData = (await axios.get(xmlUrl)).data;

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const items = result.rss.channel[0].item;
        // Check if 'g:gtin' exists for each item
        const gtins = items.map(item => item['g:gtin'] ? item['g:gtin'][0] : null).filter(gtin => gtin !== null);

        // Create a new PDF document
        const doc = new PDFDocument();
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

        // Add barcodes to the PDF
        for (const gtin of gtins) {
            const barcode = await bwipjs.toBuffer({
                bcid: 'code128',
                text: gtin,
                scale: 3,
                height: labelSize.height, // Use dynamic height
                includetext: true,
                textxalign: 'center',
            });

            doc.image(barcode, 50, doc.y, { fit: [labelSize.width, labelSize.height] });
            doc.moveDown();
        }

        doc.end();
    } catch (error) {
        console.error('Error detail:', error);
        res.status(500).send('Error processing request');
    }
});

app.get('/test-generate-barcodes', async (req, res) => {
    try {
        const xmlUrl = 'https://koolaid.stage.kyte.site/feed'; // Replace with actual URL
        const selectedSize = req.query.size || '1x2'; // You can pass size as a query parameter
        const labelSize = labelSizes[selectedSize];
        const xmlData = (await axios.get(xmlUrl)).data;

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const items = result.rss.channel[0].item;
        const gtins = items.map(item => item['g:gtin'] ? item['g:gtin'][0] : null).filter(gtin => gtin !== null);

        const doc = new PDFDocument();
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

        for (const gtin of gtins) {
            const barcode = await bwipjs.toBuffer({
                bcid: 'code128',
                text: gtin,
                scale: 3,
                height: labelSize.height, // Use dynamic height
                includetext: true,
                textxalign: 'center',
            });

            doc.image(barcode, 50, doc.y, { fit: [labelSize.width, labelSize.height] });
            doc.moveDown();
        }

        doc.end();
    } catch (error) {
        console.error('Error detail:', error);
        res.status(500).send('Error processing request');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
