class Cache {
  constructor() {
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
    this.max = 1000;
  }

  add(query, id, data) {
    if (this.data[query][id]) {
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
  size() {
    return JSON.stringify(this.data).length;
  }
}

module.exports = Cache;
