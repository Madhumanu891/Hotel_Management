const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  // No errors → move to next middleware
  if (errors.isEmpty()) {
    return next();
  }

  // Has errors → format them nicely
  const formattedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg,
    value: err.value
  }));

  // Send 422 Unprocessable Entity
  return res.status(422).json({
    success: false,
    code: 'VALIDATION_ERROR',
    message: 'Please check your input',
    errors: formattedErrors
  });
};

module.exports = validate;