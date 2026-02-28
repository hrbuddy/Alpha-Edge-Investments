const express = require('express');
const path = require('path');
const app = express();
const PORT = 1000;   // ← changed to 3000

app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Info Edge Dashboard is now LIVE at http://localhost:${PORT}`);
  console.log(`   Open http://localhost:3000 in your browser!`);
});