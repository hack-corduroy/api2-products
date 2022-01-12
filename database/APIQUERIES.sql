
-- GET /products Retrieves the list of products.
-- Time: 0.461 ms
-- param: page, count

SELECT id, name, slogan, description, category, default_price
FROM products OFFSET 100 LIMIT 50;


-- GET /products/:product_id
-- param: product_id

SELECT
  p.id, name, p.slogan, description, p.category, p.default_price,
  f.features
FROM products p LEFT JOIN (
  SELECT
  product_id, json_agg(json_build_object(feature, value)) as features
  FROM
  features where product_id = 11 group by product_id
) f on p.id = f.product_id
where p.id = 11;

