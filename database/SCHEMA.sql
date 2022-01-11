

DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
  id serial PRIMARY KEY,
  name VARCHAR(256)
);

DROP TABLE IF EXISTS products;

CREATE TABLE IF NOT EXISTS products (
   id serial PRIMARY KEY,
   campus VARCHAR(16),
   name VARCHAR(256),
   slogan VARCHAR(256),
   description TEXT,
   category_id INTEGER REFERENCES categories (id)
);

DROP TABLE IF EXISTS related (
  product_id INTEGER REFERENCES products (id)
  related_product_id INTEGER
)