
------------------------------
-- RELATED TABLE TRANSFORMS
------------------------------

WITH null_ids AS (
  SELECT r.id
  FROM related r
  LEFT JOIN products p1 on r.current_product_id = p1.id
  LEFT JOIN products p2 on r.related_product_id = p2.id
  WHERE p1.id is null OR p2.id is null
)
DELETE FROM related WHERE id IN (select id from null_ids);

ALTER TABLE related
ADD CONSTRAINT fk_related_current_product_id FOREIGN KEY (current_product_id) REFERENCES products (id);
ALTER TABLE related
ADD CONSTRAINT fk_related_related_product_id FOREIGN KEY (related_product_id) REFERENCES products (id);

------------------------------
-- FEATURES TABLE TRANSFORMS
------------------------------

WITH null_ids AS (
  SELECT f.id
  FROM features f
  LEFT JOIN products p on f.product_id = p.id
  WHERE p.id is null
)
DELETE FROM features WHERE id IN (select id from null_ids);

ALTER TABLE features
ADD CONSTRAINT fk_features_product_id FOREIGN KEY (product_id) REFERENCES products (id);


------------------------------
-- STYLES TABLE TRANSFORM
------------------------------
WITH null_ids AS (
  SELECT s.id
  FROM styles s
  LEFT JOIN products p on s.product_id = p.id
  WHERE p.id is null
)
DELETE FROM styles WHERE id IN (select id from null_ids);

ALTER TABLE styles
ADD CONSTRAINT fk_styles_product_id FOREIGN KEY (product_id) REFERENCES products (id);

------------------------------
-- SKUS TABLE TRANSFORMS
------------------------------
WITH null_ids AS (
  SELECT s.id
  FROM skus s
  LEFT JOIN styles st on s.style_id = st.id
  WHERE st.id is null
)
DELETE FROM skus WHERE id IN (select id from null_ids);

ALTER TABLE skus
ADD CONSTRAINT fk_skus_style_id FOREIGN KEY (style_id) REFERENCES styles (id);

------------------------------
-- PHOTOS TABLE TRANSFORMS
------------------------------
WITH null_ids AS (
  SELECT p.id
  FROM photos p
  LEFT JOIN styles st on p.style_id = st.id
  WHERE st.id is null
)
DELETE FROM photos WHERE id IN (select id from null_ids);

ALTER TABLE photos
ADD CONSTRAINT fk_photos_style_id FOREIGN KEY (style_id) REFERENCES styles (id);

------------------------------
-- CREATE INDEXES
------------------------------
CREATE INDEX related_current_product_id ON related(current_product_id);
CREATE INDEX related_related_product_id ON related(related_product_id);
CREATE INDEX features_product_id ON features(product_id);
CREATE INDEX styles_product_id ON styles(product_id);
CREATE INDEX photos_style_id ON photos(style_id);
CREATE INDEX skus_style_id ON skus(style_id);

