// Load songs.json and populate the table
fetch('songs.json')
  .then(response => response.json())
  .then(songs => {
    const tbody = document.querySelector('#songsTable tbody');
    songs.forEach(song => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${song.title}</td>
        <td>${song.artist}</td>
        <td>${song.year}</td>
        <td><a href="${song.albumLink}" target="_blank">${song.album}</a></td>
        <td><a href="${song.songLink}" target="_blank">Listen</a></td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(err => console.error('Error loading songs:', err));
