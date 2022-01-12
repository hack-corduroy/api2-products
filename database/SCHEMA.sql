-- Runnings
-- psql -d products -f database/SCHEMA.sql

DROP TABLE IF EXISTS products, related, features, photos, features, styles, skus CASCADE

-- \copy products from './csv/cleansed.product.csv'
-- \copy related from './csv/cleansed.related.csv'
-- \copy features from './csv/cleansed.features.csv'
-- \copy photos from './csv/cleansed.photos.csv'
-- \copy styles from './csv/cleansed.styles.csv'
-- \copy skus from './csv/cleansed.skus.csv'

------------------------------
-- | Products
------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(256),
  slogan VARCHAR(256),
  description TEXT,
  category VARCHAR(16),
  default_price VARCHAR(16)
);

------------------------------
-- | Related
------------------------------
CREATE TABLE IF NOT EXISTS related (
  id INTEGER PRIMARY KEY,
  current_product_id INTEGER,
  related_product_id INTEGER
);

------------------------------
-- | Features
------------------------------
CREATE TABLE IF NOT EXISTS features (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  feature varchar(64),
  value varchar(64)
);

------------------------------
-- | Photos
------------------------------
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY,
  style_id INTEGER,
  url varchar(256),
  thumbnail_url varchar(256)
);


----------------------------
-- | Styles
----------------------------
CREATE TABLE IF NOT EXISTS styles (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  name VARCHAR(256),
  sale_price VARCHAR(16),
  original_price VARCHAR(16),
  default_style BOOLEAN
);

------------------------------
-- | SKUS
------------------------------
CREATE TABLE IF NOT EXISTS skus (
  id INTEGER PRIMARY KEY,
  style_id INTEGER,
  size VARCHAR(16),
  quantity INTEGER
);




