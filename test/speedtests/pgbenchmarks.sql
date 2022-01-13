
\set myId random(1, 1000000)
\set myId2 random(1, 1000000)
\set myId3 random(1, 1000000)
\set myId4 random(1, 1000000)
BEGIN;
    -- GET A LIST OF ALL PRODUCTS
    SELECT id, name, slogan, description, category, default_price
    FROM products where id > :myId ORDER BY id LIMIT 10;

    -- GET PRODUCT DATA FOR A SPECIFIC PRODUCT
    SELECT
      p.id, name, p.slogan, description, p.category, p.default_price,
      f.features
    FROM products p LEFT JOIN (
      SELECT
      product_id, json_agg(json_build_object(feature, value)) as features
      FROM
      features WHERE product_id = :myId GROUP BY product_id
    ) f on p.id = f.product_id
    WHERE p.id = :myId;

    -- GET PRODUCT DATA FOR A RELATED PRODUCT
    SELECT
      p.id, name, p.slogan, description, p.category, p.default_price,
      f.features
    FROM products p LEFT JOIN (
      SELECT
      product_id, json_agg(json_build_object(feature, value)) as features
      FROM
      features WHERE product_id = :myId GROUP BY product_id
    ) f on p.id = f.product_id
    WHERE p.id = :myId2;

    -- GET PRODUCT DATA FOR A RELATED PRODUCT
    SELECT
      p.id, name, p.slogan, description, p.category, p.default_price,
      f.features
    FROM products p LEFT JOIN (
      SELECT
      product_id, json_agg(json_build_object(feature, value)) as features
      FROM
      features WHERE product_id = :myId GROUP BY product_id
    ) f on p.id = f.product_id
    WHERE p.id = :myId3;

    -- GET PRODUCT DATA FOR A RELATED PRODUCT
    SELECT
      p.id, name, p.slogan, description, p.category, p.default_price,
      f.features
    FROM products p LEFT JOIN (
      SELECT
      product_id, json_agg(json_build_object(feature, value)) as features
      FROM
      features WHERE product_id = :myId GROUP BY product_id
    ) f on p.id = f.product_id
    WHERE p.id = :myId4;

    -- GET PRODUCT STYLES FOR A SPECIFIC PRODUCT
    WITH temp as (
      SELECT
          id as style_id, product_id,
          name, original_price, sale_price, default_style
        FROM styles WHERE product_id = :myId
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

      --GET RELATED PRODUCTS
      SELECT json_agg(related_product_id) as ids FROM related
      WHERE current_product_id = :myId;
END;