const restaurantService = require("../services/restaurantService");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Menu
const getMenu = asyncHandler(async (req, res) => {
  const result = await restaurantService.getMenu(
    req.params.propertyId,
    req.query,
  );
  res.status(200).json({ success: true, ...result });
});

const createMenuItem = asyncHandler(async (req, res) => {
  const item = await restaurantService.createMenuItem(
    req.params.propertyId,
    req.body,
  );
  res.status(201).json({ success: true, data: item });
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await restaurantService.updateMenuItem(
    req.params.propertyId,
    req.params.itemId,
    req.body,
  );
  res.status(200).json({ success: true, data: item });
});

const toggleAvailability = asyncHandler(async (req, res) => {
  const item = await restaurantService.toggleItemAvailability(
    req.params.propertyId,
    req.params.itemId,
  );
  res
    .status(200)
    .json({
      success: true,
      message: `Item is now ${item.isAvailable ? "available" : "unavailable"}`,
      data: item,
    });
});

// Orders
const placeOrder = asyncHandler(async (req, res) => {
  const order = await restaurantService.placeOrder({
    propertyId: req.params.propertyId, // ADD THIS
    ...req.body,
    guestId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await restaurantService.updateOrderStatus(
    req.params.orderId,
    req.body.status,
    req.user._id,
  );
  res.status(200).json({ success: true, data: order });
});

const getOrders = asyncHandler(async (req, res) => {
  const result = await restaurantService.getOrders(
    req.params.propertyId,
    req.query,
  );
  res.status(200).json({ success: true, ...result });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await restaurantService.getGuestOrders(
    req.user._id,
    req.query,
  );
  res.status(200).json({ success: true, ...result });
});

const getLiveKitchenOrders = asyncHandler(async (req, res) => {
  const orders = await restaurantService.getLiveKitchenOrders(
    req.params.propertyId,
  );
  res.status(200).json({ success: true, data: orders, count: orders.length });
});

module.exports = {
  getMenu,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  placeOrder,
  updateOrderStatus,
  getOrders,
  getMyOrders,
  getLiveKitchenOrders,
};
