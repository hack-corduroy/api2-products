/***********************************
 * Database.js
 * Connects to postgres database and runs queries for express server
 ***********************************/

require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let pool = new Pool();

//Export a db object that has the 4 query functions to return in index.js
const db = {
  connect: async () => {
    let retries = 20;
    while (retries) {
      try {
        pool = new Pool();
        await pool.query('SELECT count(1) from products');
        console.log('>>>CONNECTED TO DB');
        return true;
      } catch (err) {
        console.log('>>>>>ERROR CONNECTING TO DB, retrying:', retries);
        await sleep(30000);
      }
      retries--;
    }
    return false;
  },

  //Returns a paginated list of products
  getProducts: async (page = 1, limit = 50) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    const sql = `
      SELECT id, name, slogan, description, category, default_price
      FROM products where id > ${start} AND id <= ${end} order by id
      `;
    let data = await pool.query(sql);
    return data.rows;
  },
  //Returns a single product
  getProduct: async (id) => {
    const sql = `
      SELECT
        p.id, name, p.slogan, description, p.category, p.default_price,
        f.features
      FROM products p LEFT JOIN (
        SELECT
        product_id, json_agg(json_build_object(feature, value)) as features
        FROM
        features where product_id = ${id} group by product_id
      ) f on p.id = f.product_id
      where p.id = ${id};
      `;
    let data = await pool.query(sql);
    return data.rows[0];
  },
  //Returns the styles for a given product
  getProductStyles: async (id) => {
    const sql = `
      WITH temp as (
        SELECT
          id as style_id, product_id,
          name, original_price, sale_price, default_style
        FROM styles WHERE product_id = ${id}
      )
      SELECT
      temp.product_id,
      json_agg(json_build_object('style_id', temp.style_id, 'name', temp.name, 'original_price',
      temp.original_price, 'sale_price', temp.sale_price, 'photos', photos.photos, 'skus', skus.skus)) as results
      FROM temp
      LEFT JOIN (
        SELECT style_id, json_agg(json_build_object('url', url, 'thumbnail_url', thumbnail_url)) as photos from photos
        WHERE style_id in (SELECT style_id FROM temp) group by style_id
      ) photos on photos.style_id = temp.style_id
      LEFT JOIN (
        SELECT style_id, json_object_agg(id, json_build_object('quantity', quantity, 'size', size)) as skus
        FROM skus WHERE style_id in (SELECT style_id FROM temp) group by style_id order by style_id
      ) skus on skus.style_id = temp.style_id
      GROUP BY temp.product_id
    `;

    let data = await pool.query(sql);
    return data.rows[0];
  },
  //returns an array of related products
  getRelated: async (id) => {
    const sql = `
      SELECT json_agg(related_product_id) as ids FROM related
      WHERE current_product_id = ${id}
      `;
    let data = await pool.query(sql);
    return data.rows[0].ids;
  },
};

module.exports = { db, pool };
