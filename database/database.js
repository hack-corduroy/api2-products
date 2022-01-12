require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;

const pool = new Pool({ connectionString: connectionString });

const db = {
  getProducts: async () => {
    const sql = `
      SELECT id, name, slogan, description, category, default_price
      FROM products LIMIT 50;
      `;
    let data = await pool.query(sql);
    return data.rows;
  },
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
    return data.rows;
  },
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
    return data.rows;
  },
  getRelated: async (id) => {
    const sql = `
      SELECT json_agg(related_product_id) as ids FROM related
      WHERE current_product_id = ${id}
      `;
    let data = await pool.query(sql);
    return data.rows[0].ids;
  },
};

module.exports = db;
