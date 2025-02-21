const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies (for POST requests, etc.)
app.use(express.json());

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../webgui/zms-wisr/dist')));

// Example API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// More API endpoints can go here
app.post('/api/data', (req, res) => {
  const { someValue } = req.body;
  // Do something with someValue
  res.json({ status: 'success', received: someValue });
});

// For any other route, serve index.html from the React build
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../webgui/zms-wisr/dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
