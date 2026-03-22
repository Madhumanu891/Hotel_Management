const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field:   err.path,
      message: err.msg,
    }));

    return res.status(422).json({
      success: false,
      code:    'VALIDATION_ERROR',
      message: formattedErrors[0].message,
      errors:  formattedErrors,
    });
  }

  next();
};

module.exports = validate;