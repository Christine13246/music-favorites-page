const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,        // export in Git Bash
  process.env.CLIENT_SECRET,    // export in Git Bash
  'http://localhost:3000/oauth2callback'
);

// YouTube client
const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client
});

// Serve static files (frontend HTML, CSS, JS)
app.use(express.static('public'));

// Route to start login
app.get('/login', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.readonly']
  });
  res.redirect(url);
});

// OAuth2 callback route
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.redirect('/');
});

// Route to fetch ALL songs in playlist with pagination
app.get('/api/songs', async (req, res) => {
  try {
    let songs = [];
    let nextPageToken = null;

    do {
      const response = await youtube.playlistItems.list({
        part: 'snippet,contentDetails',
        playlistId: 'RDCLAK5uy_k0KkqT3D_36qFNHE9rq_Iz8VT-ZV7Jt0o', // replace with your playlist ID
        maxResults: 50,
        pageToken: nextPageToken
      });

      songs = songs.concat(response.data.items.map(item => ({
        title: item.snippet.title,
        artist: item.snippet.videoOwnerChannelTitle || 'Unknown',
        releaseYear: item.snippet.publishedAt ? new Date(item.snippet.publishedAt).getFullYear() : 'N/A',
        album: 'N/A', // YouTube doesn’t provide album info
        link: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`
      })));

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    res.json(songs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching playlist');
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
