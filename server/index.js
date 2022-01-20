const express = require('express');
const app = express();
const cors = require('cors');
const { db } = require('./database.js');
const Cache = require('./cache.js');

const c = new Cache(10000);

const PORT = process.env.PORT || 8080;
const MESSAGE = process.env.MESSAGE || 'default message';

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  res.json({
    message: MESSAGE,
    date: new Date(),
  });
});

app.get('/cache', async (req, res) => {
  res.json(c.stats());
});

app.get('/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const count = parseInt(req.query.count) || 50;
  const key = page + '-' + count;
  const cached = c.get('products', key);

  if (cached !== null) {
    c.logRequest(1);
    res.json(cached);
  } else {
    c.logRequest(0);
    const data = await db.getProducts(page, count);
    res.json(data);
    c.add('products', key, data);
  }
});

app.get('/products/:id', async (req, res) => {
  const id = req.params.id;
  const cached = c.get('product', id);

  if (cached !== null) {
    c.logRequest(1);
    res.json(cached);
  } else {
    c.logRequest(0);
    const data = await db.getProduct(id);
    res.json(data);
    c.add('product', id, data);
  }
});

app.get('/products/:id/styles', async (req, res) => {
  const id = req.params.id;
  const cached = c.get('styles', id);

  if (cached !== null) {
    c.logRequest(1);
    res.json(cached);
  } else {
    c.logRequest(0);
    const data = await db.getProductStyles(id);
    res.json(data);
    c.add('styles', id, data);
  }
});

app.get('/products/:id/related', async (req, res) => {
  const id = req.params.id;
  const cached = c.get('related', id);

  if (cached !== null) {
    c.logRequest(1);
    res.status(200).send(cached);
  } else {
    c.logRequest(0);
    const data = await db.getRelated(id);
    res.status(200).send(data);
    c.add('related', id, data);
  }
});

app.listen(PORT, async () => {
  await db.connect();
  console.log('Server is running at http://localhost:' + PORT);
});
