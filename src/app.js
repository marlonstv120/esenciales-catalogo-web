const express = require('express');
const path = require('path');

const app = express();

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = app;
