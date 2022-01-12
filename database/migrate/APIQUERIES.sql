
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


-- GET GET /products/:product_id/styles
-- param: product_id

WITH temp as (
  SELECT
    id as style_id, product_id,
    name, original_price, sale_price, default_style
  FROM styles WHERE product_id = 37311
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
GROUP BY temp.product_id;


-- GET /products/:product_id/related
-- param: product_id

SELECT json_agg(related_product_id) as ids FROM related
WHERE current_product_id = 1

