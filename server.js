const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 1000;   // ← Render will override this automatically

app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Alpha Edge Dashboard running on port ${PORT}`);
});