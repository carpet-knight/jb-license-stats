const fs = require('fs');
const path = require('path');

const parse = require('csv-parse');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const initDB = async () => {
  const db = await low(new FileAsync(path.join(__dirname, 'stats.json')));

  if (!db.isEmpty().value()) {
    console.error('DB has been already initialized!');
    return;
  }

  // specify db structure
  db.defaults({
    webstorm: [],
    goland: [],
    idea: [],
  }).write();

  const ideaStats = db.get('idea');
  const golandStats = db.get('goland');
  const webstormStats = db.get('webstorm');

  const parser = fs.createReadStream(`${__dirname}/fls-data.csv`).pipe(
    parse({
      columns: true,
      cast: true,
    })
  );

  for await (const record of parser) {
    const timestamp = new Date(record.timestamp);

    if (Number.isInteger(record.idea)) {
      ideaStats.value().push({
        timestamp,
        licenseCount: record.idea,
      });
    }

    if (Number.isInteger(record.goland)) {
      golandStats.value().push({
        timestamp,
        licenseCount: record.goland,
      });
    }

    if (Number.isInteger(record.webstorm)) {
      webstormStats.value().push({
        timestamp,
        licenseCount: record.webstorm,
      });
    }
  }

  const webstormStatsSorted = webstormStats.sortBy('timestamp').value();
  const ideaStatsSorted = ideaStats.sortBy('timestamp').value();
  const golandStatsSorted = golandStats.sortBy('timestamp').value();

  const timestampMin = db._.min([
    webstormStatsSorted[0].timestamp,
    ideaStatsSorted[0].timestamp,
    golandStatsSorted[0].timestamp,
  ]);

  const timestampMax = db._.max([
    webstormStatsSorted[webstormStatsSorted.length - 1].timestamp,
    ideaStatsSorted[ideaStatsSorted.length - 1].timestamp,
    golandStatsSorted[golandStatsSorted.length - 1].timestamp,
  ]);

  db.set('meta.timestampMin', timestampMin).write();
  db.set('meta.timestampMax', timestampMax).write();

  db.set('webstorm', webstormStatsSorted).write();
  db.set('idea', ideaStatsSorted).write();
  db.set('goland', golandStatsSorted).write();
};

initDB();
