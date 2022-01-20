const { db, pool } = require('../server/database.js');

describe('Unit Tests: /products', () => {
  it('It should default to 50 items if no parameters passed', async () => {
    const data = await db.getProducts();
    expect(data.length).toEqual(50);
  });

  it('It should correctly paginate with page num', async () => {
    const data = await db.getProducts(2, 10);
    expect(data[0].id).toEqual(11);
  });

  it('It should return data in the correct shape', async () => {
    const data = await db.getProducts();
    ['name', 'slogan', 'description', 'category', 'default_price'].map((x) => {
      expect(data[0]).toHaveProperty(x);
    });
  });

  afterAll(() => {
    pool.end();
  });
});
