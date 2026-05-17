const MenuItem = require('../models/MenuItem.model');
const Order    = require('../models/Order.model');
const { publishEvent } = require('../../../shared/events/rabbitmq');
const {
  NotFoundError,
  AppError,
} = require('../../../shared/errors');

// ── Menu Management ───────────────────────────────────────────────────────────

const getMenu = async (propertyId, query = {}) => {
  const { category, vegetarian, available = true } = query;

  const filter = { propertyId };
  if (available !== 'all') filter.isAvailable = available !== 'false';
  if (category)   filter.category     = category;
  if (vegetarian) filter.isVegetarian = true;

  const items = await MenuItem.find(filter).sort({ category: 1, name: 1 }).lean();

  // Group by category
  const menu = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return { menu, totalItems: items.length };
};

const createMenuItem = async (propertyId, data) => {
  const item = await MenuItem.create({ ...data, propertyId });
  return item;
};

const updateMenuItem = async (propertyId, itemId, data) => {
  const item = await MenuItem.findOne({ _id: itemId, propertyId });
  if (!item) throw new NotFoundError('Menu item not found');
  Object.assign(item, data);
  await item.save();
  return item;
};

const toggleItemAvailability = async (propertyId, itemId) => {
  const item = await MenuItem.findOne({ _id: itemId, propertyId });
  if (!item) throw new NotFoundError('Menu item not found');
  item.isAvailable = !item.isAvailable;
  await item.save();
  return item;
};

// ── Order Management ──────────────────────────────────────────────────────────

const calculateOrderTotal = async (propertyId, items) => {
  const orderItems = [];
  let subtotal = 0;

  for (const { menuItemId, quantity, notes } of items) {
    const menuItem = await MenuItem.findOne({
      _id:         menuItemId,
      propertyId,
      isAvailable: true,
    });

    if (!menuItem) {
      throw new NotFoundError(`Menu item ${menuItemId} not found or unavailable`);
    }

    const itemSubtotal = menuItem.price * quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      menuItemId,
      name:     menuItem.name,
      price:    menuItem.price,
      quantity,
      subtotal: itemSubtotal,
      notes,
    });
  }

  const taxAmount   = Math.round(subtotal * 0.05); // 5% GST on food
  const totalAmount = subtotal + taxAmount;

  return { orderItems, subtotal, taxAmount, totalAmount };
};

const placeOrder = async ({
  propertyId,
  guestId,
  orderType,
  roomNumber,
  tableNumber,
  items,
  specialInstructions,
}) => {
  const { orderItems, subtotal, taxAmount, totalAmount } =
    await calculateOrderTotal(propertyId, items);

  // Estimate preparation time based on items
  const menuItems = await MenuItem.find({
    _id: { $in: orderItems.map(i => i.menuItemId) },
  });

  const maxPrepTime = Math.max(...menuItems.map(i => i.preparationTime || 15));
  const estimatedTime = maxPrepTime + (orderType === 'room_service' ? 10 : 0);

  const order = await Order.create({
    propertyId,
    guestId,
    orderType,
    roomNumber,
    tableNumber,
    items:       orderItems,
    subtotal,
    taxAmount,
    totalAmount,
    specialInstructions,
    estimatedTime,
    status: 'placed',
  });

  // Notify kitchen via RabbitMQ
  try {
    await publishEvent('order.placed', {
      orderId:    order._id,
      orderRef:   order.orderRef,
      propertyId,
      items:      orderItems.map(i => ({ name: i.name, quantity: i.quantity, notes: i.notes })),
      orderType,
      roomNumber,
      tableNumber,
      estimatedTime,
    });
  } catch (err) {
    // Non-critical
  }

  return order;
};

const updateOrderStatus = async (orderId, status, staffId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new NotFoundError('Order not found');

  const validTransitions = {
    placed:    ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready'],
    ready:     ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    throw new AppError(
      `Cannot change status from "${order.status}" to "${status}"`,
      400, 'INVALID_TRANSITION'
    );
  }

  order.status = status;

  // Set timestamp for each status
  const timestamps = {
    confirmed: 'confirmedAt',
    preparing: 'preparingAt',
    ready:     'readyAt',
    delivered: 'deliveredAt',
  };

  if (timestamps[status]) order[timestamps[status]] = new Date();
  await order.save();

  // Publish status update
  try {
    await publishEvent('order.statusUpdated', {
      orderId:  order._id,
      orderRef: order.orderRef,
      status,
      guestId:  order.guestId,
    });
  } catch (err) {
    // Non-critical
  }

  return order;
};

const getOrders = async (propertyId, query = {}) => {
  const { status, orderType, page = 1, limit = 20 } = query;

  const filter = { propertyId };
  if (status)    filter.status    = status;
  if (orderType) filter.orderType = orderType;

  const total  = await Order.countDocuments(filter);
  const orders = await Order
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    orders,
    pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  };
};

const getGuestOrders = async (guestId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const total  = await Order.countDocuments({ guestId });
  const orders = await Order
    .find({ guestId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    orders,
    pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  };
};

const getLiveKitchenOrders = async (propertyId) => {
  const orders = await Order
    .find({
      propertyId,
      status: { $in: ['placed', 'confirmed', 'preparing'] },
    })
    .sort({ createdAt: 1 })
    .lean();

  return orders;
};

module.exports = {
  getMenu,
  createMenuItem,
  updateMenuItem,
  toggleItemAvailability,
  placeOrder,
  updateOrderStatus,
  getOrders,
  getGuestOrders,
  getLiveKitchenOrders,
};