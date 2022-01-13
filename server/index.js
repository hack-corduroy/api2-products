const express = require('express');
const app = express();
const cors = require('cors');
const { db } = require('../database/database.js');
const Cache = require('./cache.js');

const c = new Cache();

const PORT = 3000;
app.use(cors());
app.use(express.json());

app.get('/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const count = parseInt(req.query.count) || 50;
  const key = page + '-' + count;
  const cached = c.get('products', key);

  if (cached !== null) {
    console.log('send back a cache');
    res.json(cached);
  } else {
    console.log('needed to hit the DB');
    const data = await db.getProducts(page, count);
    res.json(data);
    c.add('products', key, data);
  }
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
  //const id = req.params.id;
  //const data = await db.getRelated(id);
  res.status(200).send(data);
});

app.listen(PORT, () => {
  console.log('Server is running at http://localhost:' + PORT);
});
