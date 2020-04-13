const { auth } = require('google-auth-library');
const { google } = require('googleapis');
const fs = require('fs');

let youtube;

function client() {
    if (youtube === undefined) {
        const text = fs.readFileSync(process.env.GOOGLE_API_CREDS_FILE);
        const creds = JSON.parse(text);
        const authClient = auth.fromJSON(creds);
        authClient.scopes = [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtubepartner',
            'https://www.googleapis.com/auth/youtube.force-ssl',
        ];
        youtube = google.youtube({
            version: 'v3',
            auth: authClient,
        });
    }
    return youtube;
}

module.exports = client;
