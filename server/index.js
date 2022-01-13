const express = require('express');
const app = express();
const cors = require('cors');
const { db } = require('../database/database.js');

const PORT = 3000;
app.use(cors());

app.get('/loaderio-7489276b295bbca6259f9144349ee896.txt', (req, res) => {
  res.send('loaderio-7489276b295bbca6259f9144349ee896');
});

app.get('/hello', async (req, res) => {
  res.json({ hello: 'world' });
});

app.get('/products', async (req, res) => {
  const data = await db.getProducts();
  res.json(data);
});

app.get('/products/:id', async (req, res) => {
  const id = req.params.id;
  const data = await db.getProduct(id);
  res.json(data);
});

app.get('/products/:id/styles', async (req, res) => {
  const id = req.params.id;
  const data = await db.getProductStyles(id);
  res.json(data);
});

app.get('/products/:id/related', async (req, res) => {
  const id = req.params.id;
  const data = await db.getRelated(id);
  res.status(200).send(data);
});

app.listen(PORT, () => {
  console.log('Server is running at http://localhost:' + PORT);
});
