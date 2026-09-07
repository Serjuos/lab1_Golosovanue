// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const api = require('./api');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api);

const PORT = process.env.PORT || 3000;

db.ready.then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});