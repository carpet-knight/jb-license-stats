const express = require('express');

const { connectDB } = require('./utils/dbUtil');
const { notAllowedHandler, basicHandler, notFoundHandler } = require('./errorHandlers');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 9000;

const app = express();

app.set('x-powered-by', false);

connectDB()
  .then((db) => {
    // routes
    app.use('/api/stats', require('./routes/stats'));

    // handle errors
    app.use(notFoundHandler);
    app.use(basicHandler);

    app.listen(PORT, () => console.log(`Running on http://${HOST}:${PORT}`));
  })
  .catch((err) => console.error('Something went terribly wrong.', err));
