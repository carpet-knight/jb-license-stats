function notFoundHandler(req, res) {
  return res.json({
    status: 404,
    type: 'Not Found',
    message: 'Requested Resource Not Found',
  });
}

function basicHandler(err, req, res, next) {
  return res.status(500).json({
    status: 500,
    type: 'Internal Server Error',
    message: 'Something went wrong',
  });
}

module.exports = {
  notFoundHandler,
  basicHandler,
};
