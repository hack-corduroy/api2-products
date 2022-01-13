/****************************
 * EXPRESS
 ****************************/

// const express = require('express');
// const app = express();
// const cors = require('cors');
// const { db } = require('../database/database.js');

// const PORT = 3000;
// app.use(cors());

// app.get('/products', async (req, res) => {
//   const data = await db.getProducts();
//   res.json(data);
// });

// app.get('/products/:id', async (req, res) => {
//   const id = req.params.id;
//   const data = await db.getProduct(id);
//   res.json(data);
// });

// app.get('/products/:id/styles', async (req, res) => {
//   const id = req.params.id;
//   const data = await db.getProductStyles(id);
//   res.json(data);
// });

// app.get('/products/:id/related', async (req, res) => {
//   const id = req.params.id;
//   const data = await db.getRelated(id);
//   res.status(200).send(data);
// });

// app.listen(PORT, () => {
//   console.log('Server is running at http://localhost:' + PORT);
// });

/****************************
 * Fastify
 ****************************/

const fastify = require('fastify')({ logger: false });
const { db } = require('../database/database.js');

fastify.get('/products', async function (request, reply) {
  const data = await db.getProducts();
  reply.send(data);
});

fastify.get('/products/:id', async function (request, reply) {
  const id = request.params.id;
  const data = await db.getProduct(id);
  reply.send(data);
});

fastify.get('/products/:id/styles', async function (request, reply) {
  const id = request.params.id;
  const data = await db.getProductStyles(id);
  return data;
});

fastify.get('/products/:id/related', async function (request, reply) {
  const id = request.params.id;
  const data = await db.getRelated(id);
  return data;
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000);
    console.log('listening on 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
