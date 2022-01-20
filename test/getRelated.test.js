const { db, pool } = require('../server/database.js');

describe('Unit Tests: /products/:id/related endpoint', () => {
  it('It should return an array', async () => {
    const data = await db.getRelated(1);
    expect(data).toEqual([2, 3, 8, 7]);
  });

  afterAll(() => {
    pool.end();
  });
});
