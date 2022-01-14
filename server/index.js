const express = require('express');
const app = express();
const cors = require('cors');
const pino = require('pino');
const logger = pino({ prettyPrint: true }, pino.destination('./pino-logger.log'));
const { db } = require('../database/database.js');
const Cache = require('./cache.js');

const c = new Cache(2000);
let cnum = 0;
let dbnum = 0;

const PORT = 3000;
app.use(cors());
app.use(express.json());

//custom middleware to log info
app.use((req, res, next) => {
  logger.info(
    `${cnum} / ${cnum + dbnum} = ${Math.round((100 * cnum) / (cnum + dbnum))}%\t${c.count(1)}\t${
      c.size() / 1000
    }\t${req.url}`
  );
  next();
});

app.get('/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const count = parseInt(req.query.count) || 50;
  const key = page + '-' + count;
  const cached = c.get('products', key);

  if (cached !== null) {
    res.json(cached);
    cnum++;
  } else {
    const data = await db.getProducts(page, count);
    res.json(data);
    c.add('products', key, data);
    dbnum++;
  }
});

app.get('/products/:id', async (req, res) => {
  const id = req.params.id;
  const cached = c.get('product', id);

  if (cached !== null) {
    res.json(cached);
    cnum++;
  } else {
    const data = await db.getProduct(id);
    res.json(data);
    c.add('product', id, data);
    dbnum++;
  }
});

app.get('/products/:id/styles', async (req, res) => {
  const id = req.params.id;
  const cached = c.get('styles', id);

  if (cached !== null) {
    res.json(cached);
    cnum++;
  } else {
    const data = await db.getProductStyles(id);
    res.json(data);
    c.add('styles', id, data);
    dbnum++;
  }
});

app.get('/products/:id/related', async (req, res) => {
  const id = req.params.id;
  const cached = c.get('related', id);

  if (cached !== null) {
    res.status(200).send(cached);
    cnum++;
  } else {
    const data = await db.getRelated(id);
    res.status(200).send(data);
    c.add('related', id, data);
    dbnum++;
  }
});

app.listen(PORT, () => {
  console.log('Server is running at http://localhost:' + PORT);
});
