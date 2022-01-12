const { db, pool } = require('../../database/database.js');

let time1, time2, data, ids;

(async function main() {
  //console.log('--------------------------');
  //console.log('Benchmarking: getProducts');
  //console.log('--------------------------');
  for (let i = 0; i < 5; i++) {
    time1 = new Date().getTime();
    await db.getProducts();
    time2 = new Date().getTime();
    console.log('Run(' + i + '): getProducts() => ', time2 - time1, 'ms');
  }

  //console.log('--------------------------');
  //console.log('Benchmarking: getProduct(id)');
  //console.log('--------------------------');
  data = await pool.query('select id from products ORDER BY RANDOM() limit 5');
  ids = data.rows.map((x) => x.id);
  for (let i = 0; i < ids.length; i++) {
    time1 = new Date().getTime();
    await db.getProduct(ids[i]);
    time2 = new Date().getTime();
    console.log('Run(' + i + '): getProducts(' + ids[i] + ') => ', time2 - time1, 'ms');
  }

  //console.log('--------------------------');
  //console.log('Benchmarking: getRelated(id)');
  //console.log('--------------------------');
  data = await pool.query('select id from products ORDER BY RANDOM() limit 5');
  ids = data.rows.map((x) => x.id);
  for (let i = 0; i < ids.length; i++) {
    time1 = new Date().getTime();
    await db.getRelated(ids[i]);
    time2 = new Date().getTime();
    console.log('Run(' + i + '): getRelated(' + ids[i] + ') => ', time2 - time1, 'ms');
  }

  //console.log('--------------------------');
  //console.log('Benchmarking: getProductStyles(id)');
  //console.log('--------------------------');
  data = await pool.query('select id from products ORDER BY RANDOM() limit 5');
  ids = data.rows.map((x) => x.id);
  for (let i = 0; i < ids.length; i++) {
    time1 = new Date().getTime();
    await db.getProductStyles(ids[i]);
    time2 = new Date().getTime();
    console.log('Run(' + i + '): getProductStyles(' + ids[i] + ') => ', time2 - time1, 'ms');
  }

  pool.end();
})();
