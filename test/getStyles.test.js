const { db, pool } = require('../database/database.js');

describe('Unit Tests: /products/:id/styles endpoint', () => {
  it('It should be a styles shaped object', async () => {
    const data = await db.getProductStyles(1);
    expect(data.product_id).toEqual(1);
    expect(Array.isArray(data.results)).toEqual(true);
  });

  it('It should have results that contain skus/photos', async () => {
    const data = await db.getProductStyles(1);
    expect(data.results[0].style_id).toEqual(1);
    expect(typeof data.results[0].skus).toEqual('object');
    expect(Array.isArray(data.results[0].photos)).toEqual(true);
    ['name', 'original_price', 'sale_price'].map((x) => {
      expect(data.results[0]).toHaveProperty(x);
    });
  });

  afterAll(() => {
    pool.end();
  });
});
