const { db, pool } = require('../server/database.js');

describe('Unit Tests: /products/:id endpoint', () => {
  it('It should contain a product-shaped object', async () => {
    const data = await db.getProduct(1);
    ['name', 'slogan', 'description', 'category', 'default_price', 'features'].map((x) => {
      expect(data).toHaveProperty(x);
    });
  });

  it('It should contain an array of features', async () => {
    const data = await db.getProduct(2);
    expect(Array.isArray(data.features)).toEqual(true);
  });

  afterAll(() => {
    pool.end();
  });
});
