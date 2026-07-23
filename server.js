const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:3000/oauth2callback"
);

// Redirect user to Google login
app.get('/login', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.readonly']
  });
  res.redirect(url);
});

// Handle OAuth callback
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.redirect('/');
});

// API route to fetch liked videos (YouTube “Liked Videos” playlist)
app.get('/api/songs', async (req, res) => {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const response = await youtube.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId: 'RDCLAK5uy_k0KkqT3D_36qFNHE9rq_Iz8VT-ZV7Jt0o&playnext=1&si=dadLnP6qtGEnCiTT', 
      maxResults: 10
    });

    const songs = response.data.items.map(item => ({
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      year: new Date(item.snippet.publishedAt).getFullYear(),
      album: "N/A", // YouTube doesn’t expose album info directly
      albumLink: item.snippet.channelId ? `https://music.youtube.com/channel/${item.snippet.channelId}` : "#",
      songLink: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`
    }));

    res.json(songs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching songs');
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
