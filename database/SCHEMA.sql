-- Runnings
-- psql -d products -f database/SCHEMA.sql

------------------------------
-- | Categories
------------------------------
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id serial PRIMARY KEY,
  name VARCHAR(256)
);

------------------------------
-- | Products
------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE IF NOT EXISTS products (
   id serial PRIMARY KEY,
   campus VARCHAR(16),
   name VARCHAR(256),
   slogan VARCHAR(256),
   description TEXT,
   default_price VARCHAR(16),
   category_id INTEGER REFERENCES categories (id)
);

------------------------------
-- | Related
------------------------------
DROP TABLE IF EXISTS related;
CREATE TABLE IF NOT EXISTS related (
  product_id INTEGER REFERENCES products (id),
  related_product_id INTEGER REFERENCES products (id)
);

------------------------------
-- | Features
------------------------------
DROP TABLE IF EXISTS features;
CREATE TABLE IF NOT EXISTS features (
  id serial PRIMARY KEY,
  data JSON
);

------------------------------
-- | products_features
------------------------------
DROP TABLE IF EXISTS products_features;
CREATE TABLE IF NOT EXISTS products_features (
  id serial PRIMARY KEY,
  product_id INTEGER REFERENCES products (id),
  feature_id INTEGER REFERENCES features (id)
);

------------------------------
-- | Styles
------------------------------
DROP TABLE IF EXISTS styles;
CREATE TABLE IF NOT EXISTS styles (
  id serial PRIMARY KEY,
  name VARCHAR(256),
  original_price VARCHAR(16),
  sale_price VARCHAR(16),
  "default" BOOLEAN,
  photos JSON
);

------------------------------
-- | SKUS
------------------------------
DROP TABLE IF EXISTS skus;
CREATE TABLE IF NOT EXISTS skus (
  id serial PRIMARY KEY,
  name VARCHAR(256),
  quantity INTEGER
);

------------------------------
-- | SKUS-STYLES
------------------------------
DROP TABLE IF EXISTS styles_skus;
CREATE TABLE IF NOT EXISTS styles_skus (
  id serial PRIMARY KEY,
  style_id INTEGER REFERENCES styles (id),
  sku_id INTEGER REFERENCES skus (id)
);

------------------------------
-- | products_styles
------------------------------
DROP TABLE IF EXISTS products_styles;
CREATE TABLE IF NOT EXISTS products_styles (
  id serial PRIMARY KEY,
  product_id INTEGER REFERENCES products (id),
  style_id INTEGER REFERENCES styles (id)
);


------------------------------
-- | PRINT DB
------------------------------
SELECT
   table_name,
   column_name,
   data_type
FROM
   information_schema.columns
WHERE
  table_name in ('products','categories','realted_products','products_styles','products_features','features','styles','styles_skus','skus')
ORDER BY
  table_name, ordinal_position;

select * from information_schema.table_constraints where constraint_type = 'FOREIGN KEY';





