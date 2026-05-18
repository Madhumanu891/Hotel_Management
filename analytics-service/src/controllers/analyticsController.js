const analyticsService = require('../services/analyticsService');
const asyncHandler     = require('../../../shared/utils/asyncHandler');

const getRevenueReport = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { startDate, endDate, groupBy } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate and endDate are required',
    });
  }

  const report = await analyticsService.getRevenueReport({
    propertyId, startDate, endDate, groupBy,
  });

  res.status(200).json({ success: true, data: report });
});

const getOccupancyReport = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate and endDate are required',
    });
  }

  const report = await analyticsService.getOccupancyReport({
    propertyId, startDate, endDate,
  });

  res.status(200).json({ success: true, data: report });
});

const getBookingStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getBookingStats(req.params.propertyId);
  res.status(200).json({ success: true, data: stats });
});

module.exports = { getRevenueReport, getOccupancyReport, getBookingStats };