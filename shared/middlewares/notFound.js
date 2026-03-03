const { NotFoundError } = require('../errors');

const notFound = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl}`));
};

module.exports = notFound;