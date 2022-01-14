class Cache {
  constructor(maxItems = 1000) {
    this.ids = {
      products: [],
      related: [],
      styles: [],
      product: [],
    };
    this.data = {
      products: {},
      related: {},
      styles: {},
      product: {},
    };
    this.max = maxItems;
  }

  add(query, id, data) {
    if (this.data[query][id] !== undefined) {
      return;
    }

    if (this.ids[query].length === this.max) {
      let temp = this.ids[query].pop();
      delete this.data[query][temp];
    }
    this.ids[query].unshift(id);
    this.data[query][id] = data;
  }

  get(query, id) {
    return this.data[query][id] || null;
  }

  //FOR DEBUGGING ONLY, DONT RUN IN PRODUCTION
  stats() {
    return {
      max: this.max,
      sizes: {
        products: this.ids.products.length,
        product: this.ids.product.length,
        related: this.ids.related.length,
        styles: this.ids.styles.length,
      },
      total:
        this.ids.products.length +
        this.ids.related.length +
        this.ids.styles.length +
        this.ids.product.length,
      kb: JSON.stringify(this.data).length / 1000,
    };
  }
}

module.exports = Cache;
