const database = {
  version: 1,

  collections: {
    users: [],
    announcements: [],
    orders: [],
    packs: [],
    boosts: [],
    transactions: [],
    commissions: []
  },

  create(collection, record) {
    if (!this.collections[collection]) {
      throw new Error(`Collection inconnue : ${collection}`);
    }

    const item = {
      id: `${collection}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      ...record,
      createdAt: new Date().toISOString()
    };

    this.collections[collection].push(item);

    return item;
  },

  find(collection, id) {
    if (!this.collections[collection]) {
      return null;
    }

    return this.collections[collection].find(item => item.id === id) || null;
  },

  findAll(collection, filter = {}) {
    if (!this.collections[collection]) {
      return [];
    }

    return this.collections[collection].filter(item =>
      Object.entries(filter).every(
        ([key, value]) => item[key] === value
      )
    );
  },

  update(collection, id, updates) {
    const item = this.find(collection, id);

    if (!item) {
      return null;
    }

    Object.assign(item, updates, {
      updatedAt: new Date().toISOString()
    });

    return item;
  },

  delete(collection, id) {
    if (!this.collections[collection]) {
      return false;
    }

    const before = this.collections[collection].length;

    this.collections[collection] =
      this.collections[collection].filter(item => item.id !== id);

    return this.collections[collection].length < before;
  },

  clear(collection) {
    if (!this.collections[collection]) {
      return false;
    }

    this.collections[collection] = [];
    return true;
  }
};

if (typeof module !== "undefined") {
  module.exports = database;
}
