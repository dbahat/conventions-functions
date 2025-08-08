import { join } from 'path';
import { readFile } from 'fs/promises';

export async function sendPushConsole(req, res) {
    console.log("sendPushConsole started");
    try {
        const htmlPath = './index.html';
        const data = await readFile(htmlPath, 'utf8')
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(data);
    } catch (err) {
        console.error('Error reading HTML file:', err);
        res.status(500).send('Error loading page');
    }
}