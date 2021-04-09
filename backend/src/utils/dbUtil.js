const path = require('path');

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const DB_PATH = path.join(__dirname, '..', '..', 'db', 'stats.json');

let _db;

module.exports = {
  connectDB: async () => {
    _db = await low(new FileAsync(DB_PATH));
    return _db;
  },
  getDB: () => _db,
};
