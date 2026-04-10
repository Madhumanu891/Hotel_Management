const { body, query, param } = require('express-validator');

const validateCreateProperty = [
  body('name')
    .trim()
    .notEmpty().withMessage('Property name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('starRating')
    .notEmpty().withMessage('Star rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Star rating must be between 1 and 5'),

  body('location.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('location.state')
    .trim()
    .notEmpty().withMessage('State is required'),

  body('location.address')
    .trim()
    .notEmpty().withMessage('Address is required'),
];

const validateCreateRoomType = [
  body('name')
    .trim()
    .notEmpty().withMessage('Room type name is required'),

  body('basePrice')
    .notEmpty().withMessage('Base price is required')
    .isNumeric().withMessage('Base price must be a number')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),

  body('maxOccupancy')
    .notEmpty().withMessage('Max occupancy is required')
    .isInt({ min: 1 }).withMessage('Max occupancy must be at least 1'),

  body('weekendMultiplier')
    .optional()
    .isFloat({ min: 1.0, max: 3.0 }).withMessage('Weekend multiplier must be between 1.0 and 3.0'),
];

const validateCreateRoom = [
  body('roomTypeId')
    .notEmpty().withMessage('Room type ID is required')
    .isMongoId().withMessage('Invalid room type ID'),

  body('roomNumber')
    .trim()
    .notEmpty().withMessage('Room number is required'),

  body('floor')
    .optional()
    .isInt({ min: 0 }).withMessage('Floor must be a non-negative number'),
];

const validateAvailabilitySearch = [
  query('checkIn')
    .notEmpty().withMessage('Check-in date is required')
    .isISO8601().withMessage('Check-in must be a valid date (YYYY-MM-DD)'),

  query('checkOut')
    .notEmpty().withMessage('Check-out date is required')
    .isISO8601().withMessage('Check-out must be a valid date (YYYY-MM-DD)'),

  query('adults')
    .optional()
    .isInt({ min: 1 }).withMessage('Adults must be at least 1'),
];

const validateUpdateRoomStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['available', 'occupied', 'maintenance', 'out_of_service'])
    .withMessage('Invalid status value'),
];

module.exports = {
  validateCreateProperty,
  validateCreateRoomType,
  validateCreateRoom,
  validateAvailabilitySearch,
  validateUpdateRoomStatus,
};