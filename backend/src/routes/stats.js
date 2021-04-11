// const dayjs = require('dayjs');
// const quarterPlugin = require('dayjs/plugin/quarterOfYear');
const { Router } = require('express');

const { getDB } = require('../utils/dbUtil');

const router = Router();
const db = getDB();

const PRODUCTS = ['idea', 'goland', 'webstorm'];

// const getStatsWithinRange = (stats, rangeStart, rangeEnd) => {
//   const filtered = [];

//   for (const stat of stats) {
//     const timestamp = dayjs(stat.timestamp);

//     if (timestamp < rangeStart || timestamp >= rangeEnd) break;

//     filtered.push(stat);
//   }

//   return filtered;
// };

// dayjs.extend(quarterPlugin);

// route:/api/stats/
router.route('/').get((req, res) => {
  return res.json({
    idea: db.get('idea').values(),
    goland: db.get('goland').values(),
    webstorm: db.get('webstorm').values(),
    dateRange: {
      from: db.get('meta.timestampMin'),
      to: db.get('meta.timestampMax'),
    },
  });
});

// route:/api/stats/:product
router.route('/:product').get((req, res, next) => {
  const product = req.params.product.trim();

  if (!PRODUCTS.includes(product)) {
    return next();
  }

  return res.json(db.get(product).values());
});

module.exports = router;
