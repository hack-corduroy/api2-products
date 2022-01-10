const express = require('express');
const app = express();
const PORT = 3000;

app.get('/hello', (req, res) => {
  res.json({ hello: 'world' });
});

app.listen(PORT, () => {
  console.log('Server is running at http://localhost:' + PORT);
});
