const axios          = require('axios');
const { getRedisClient } = require('../config/redis');

const CACHE_TTL = 60 * 60; // 1 hour

const getCache = async (key) => {
  try {
    const redis  = getRedisClient();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
};

const setCache = async (key, data) => {
  try {
    const redis = getRedisClient();
    await redis.setex(key, CACHE_TTL, JSON.stringify(data));
  } catch { /* non-critical */ }
};

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE REPORT
// Fetches payments from payment-service and aggregates by date
// ─────────────────────────────────────────────────────────────────────────────
const getRevenueReport = async ({ propertyId, startDate, endDate, groupBy = 'day' }) => {
  const cacheKey = `analytics:revenue:${propertyId}:${startDate}:${endDate}:${groupBy}`;
  const cached   = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  // Fetch all confirmed bookings for date range from booking-service
  let bookings = [];
  try {
    const res = await axios.get(
      `${process.env.BOOKING_SERVICE_URL}/api/bookings/property/${propertyId}`,
      {
        params: {
          status:   'checked_out',
          checkIn:  startDate,
          checkOut: endDate,
          limit:    1000,
        },
        headers: { 'x-internal-service': 'analytics-service' },
      }
    );
    bookings = res.data.bookings || [];
  } catch (err) {
    bookings = [];
  }

  // Aggregate revenue by day/week/month
  const revenueMap = {};

  bookings.forEach(booking => {
    const date = new Date(booking.checkInDate);
    let key;

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekNum = Math.ceil(date.getDate() / 7);
      key = `${date.getFullYear()}-W${weekNum}`;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!revenueMap[key]) {
      revenueMap[key] = { date: key, revenue: 0, bookings: 0, avgRevenue: 0 };
    }

    revenueMap[key].revenue   += booking.pricing?.totalAmount || 0;
    revenueMap[key].bookings  += 1;
  });

  // Calculate averages
  Object.values(revenueMap).forEach(item => {
    item.avgRevenue = item.bookings > 0
      ? Math.round(item.revenue / item.bookings)
      : 0;
  });

  const data = Object.values(revenueMap).sort((a, b) => a.date.localeCompare(b.date));

  const totalRevenue  = data.reduce((sum, d) => sum + d.revenue,  0);
  const totalBookings = data.reduce((sum, d) => sum + d.bookings, 0);

  const result = {
    propertyId,
    startDate,
    endDate,
    groupBy,
    data,
    summary: {
      totalRevenue,
      totalBookings,
      averageRevenue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
    },
  };

  await setCache(cacheKey, result);
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// OCCUPANCY REPORT
// ─────────────────────────────────────────────────────────────────────────────
const getOccupancyReport = async ({ propertyId, startDate, endDate }) => {
  const cacheKey = `analytics:occupancy:${propertyId}:${startDate}:${endDate}`;
  const cached   = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  let bookings   = [];
  let totalRooms = 0;

  try {
    const [bookingRes, roomRes] = await Promise.all([
      axios.get(
        `${process.env.BOOKING_SERVICE_URL}/api/bookings/property/${propertyId}`,
        {
          params: { status: 'checked_out', checkIn: startDate, checkOut: endDate, limit: 1000 },
          headers: { 'x-internal-service': 'analytics-service' },
        }
      ),
      axios.get(
        `${process.env.PROPERTY_SERVICE_URL}/api/properties/${propertyId}/rooms`,
        { headers: { 'x-internal-service': 'analytics-service' } }
      ),
    ]);
    bookings   = bookingRes.data.bookings || [];
    totalRooms = roomRes.data.data?.length || 0;
  } catch (err) {
    bookings = [];
  }

  // Calculate occupancy per day
  const start      = new Date(startDate);
  const end        = new Date(endDate);
  const totalDays  = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const occupancyData = [];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Count bookings that cover this date
    const occupiedRooms = bookings.filter(b => {
      const checkIn  = new Date(b.checkInDate);
      const checkOut = new Date(b.checkOutDate);
      return checkIn <= date && checkOut > date;
    }).length;

    const occupancyRate = totalRooms > 0
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

    occupancyData.push({
      date:          dateStr,
      occupiedRooms,
      totalRooms,
      occupancyRate,
    });
  }

  const avgOccupancy = occupancyData.length > 0
    ? Math.round(occupancyData.reduce((sum, d) => sum + d.occupancyRate, 0) / occupancyData.length)
    : 0;

  const result = {
    propertyId, startDate, endDate,
    data: occupancyData,
    summary: { avgOccupancyRate: avgOccupancy, totalRooms },
  };

  await setCache(cacheKey, result);
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING STATS — quick summary for dashboard
// ─────────────────────────────────────────────────────────────────────────────
const getBookingStats = async (propertyId) => {
  const cacheKey = `analytics:stats:${propertyId}`;
  const cached   = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const today     = new Date().toISOString().split('T')[0];
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];

  let stats = {
    todayArrivals:    0,
    todayDepartures:  0,
    currentOccupancy: 0,
    monthlyBookings:  0,
    monthlyRevenue:   0,
  };

  try {
    const res = await axios.get(
      `${process.env.BOOKING_SERVICE_URL}/api/bookings/property/${propertyId}`,
      {
        params: { limit: 1000 },
        headers: { 'x-internal-service': 'analytics-service' },
      }
    );

    const bookings = res.data.bookings || [];

    stats.todayArrivals    = bookings.filter(b => b.checkInDate?.startsWith(today) && b.status === 'confirmed').length;
    stats.todayDepartures  = bookings.filter(b => b.checkOutDate?.startsWith(today) && b.status === 'checked_in').length;
    stats.currentOccupancy = bookings.filter(b => b.status === 'checked_in').length;
    stats.monthlyBookings  = bookings.filter(b => b.createdAt >= monthStartStr).length;
    stats.monthlyRevenue   = bookings
      .filter(b => b.createdAt >= monthStartStr && ['confirmed','checked_in','checked_out'].includes(b.status))
      .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

  } catch (err) {
    // Return empty stats if booking service is down
  }

  await setCache(cacheKey, stats);
  return stats;
};

module.exports = { getRevenueReport, getOccupancyReport, getBookingStats };