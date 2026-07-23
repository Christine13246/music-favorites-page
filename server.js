const express = require('express');
const { google } = require('googleapis');
const app = express();

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,        // exported in Git Bash
  process.env.CLIENT_SECRET,    // exported in Git Bash
  'http://localhost:3000/oauth2callback' // must match redirect URI in Google Cloud
);

// YouTube client
const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client
});

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

// Route to fetch songs
app.get('/api/songs', async (req, res) => {
  try {
    const response = await youtube.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId: 'RDCLAK5uy_k0KkqT3D_36qFNHE9rq_Iz8VT-ZV7Jt0o', // your playlist ID
      maxResults: 10
    });

    const songs = response.data.items.map(item => ({
      title: item.snippet.title,
      artist: item.snippet.videoOwnerChannelTitle || 'Unknown',
      releaseYear: item.snippet.publishedAt ? new Date(item.snippet.publishedAt).getFullYear() : 'N/A',
      album: 'N/A',
      link: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`
    }));

    res.json(songs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching playlist');
  }
});

// Serve frontend
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
