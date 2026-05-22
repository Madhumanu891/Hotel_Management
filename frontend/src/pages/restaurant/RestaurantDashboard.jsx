import { useState } from 'react';
import {
  ChefHat, Clock, CheckCircle, Utensils,
  AlertCircle, RefreshCw, Plus, X, Search,
  Coffee, UtensilsCrossed, Circle,
} from 'lucide-react';
import {
  useLiveOrders, useOrders, useMenu,
  useUpdateOrderStatus, useCreateMenuItem,
  useToggleItemAvailability,
} from '../../hooks/useRestaurant';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';
import Button  from '../../components/ui/Button';

// ── Order status config ─────────────────────────────────────────────────────
const orderStatusConfig = {
  placed:    { label: 'New Order',  color: 'border-red-400 bg-red-50',    badge: 'badge-error',   next: 'confirmed'  },
  confirmed: { label: 'Confirmed',  color: 'border-blue-400 bg-blue-50',  badge: 'badge-info',    next: 'preparing'  },
  preparing: { label: 'Preparing',  color: 'border-yellow-400 bg-yellow-50', badge: 'badge-warning', next: 'ready'   },
  ready:     { label: 'Ready',      color: 'border-green-400 bg-green-50',badge: 'badge-success', next: 'delivered'  },
  delivered: { label: 'Delivered',  color: 'border-gray-300 bg-gray-50',  badge: 'badge-purple',  next: null         },
  cancelled: { label: 'Cancelled',  color: 'border-gray-300 bg-gray-50',  badge: 'badge-error',   next: null         },
};

const nextStatus = {
  placed:    'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready:     'delivered',
};

const nextLabel = {
  placed:    'Confirm',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready:     'Mark Delivered',
};

// ── Live Order Card ─────────────────────────────────────────────────────────
const LiveOrderCard = ({ order, onUpdate, isUpdating }) => {
  const config  = orderStatusConfig[order.status] || orderStatusConfig.placed;
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const isUrgent = elapsed > 20 && order.status !== 'delivered';

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all ${config.color} ${
      isUrgent ? 'animate-pulse' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-bold text-gray-900 font-mono">{order.orderRef}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={config.badge}>{config.label}</span>
            {order.orderType === 'room_service' && (
              <span className="badge-purple">Room {order.roomNumber}</span>
            )}
            {order.orderType === 'dine_in' && (
              <span className="badge-info">Table {order.tableNumber}</span>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${
          elapsed > 20 ? 'text-red-600' : elapsed > 10 ? 'text-yellow-600' : 'text-gray-500'
        }`}>
          <Clock className="h-4 w-4" />
          {elapsed}m
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-white border flex items-center justify-center text-xs font-bold text-gray-700">
                {item.quantity}
              </span>
              <span className="font-medium text-gray-800">{item.name}</span>
            </div>
            {item.notes && (
              <span className="text-xs text-orange-600 italic ml-2">"{item.notes}"</span>
            )}
          </div>
        ))}
      </div>

      {/* Special instructions */}
      {order.specialInstructions && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          {order.specialInstructions}
        </div>
      )}

      {/* Estimated time */}
      {order.estimatedTime && order.status !== 'delivered' && (
        <div className="text-xs text-gray-500 mb-3">
          Est. {order.estimatedTime} min
        </div>
      )}

      {/* Action button */}
      {nextStatus[order.status] && (
        <Button
          onClick={() => onUpdate({ orderId: order._id, status: nextStatus[order.status] })}
          loading={isUpdating}
          className="w-full py-2 text-sm"
        >
          {nextLabel[order.status]}
        </Button>
      )}
    </div>
  );
};

// ── Add Menu Item Modal ─────────────────────────────────────────────────────
const AddMenuItemModal = ({ propertyId, onClose }) => {
  const [form, setForm] = useState({
    name: '', category: 'breakfast', price: '',
    isVegetarian: false, preparationTime: 15, description: '',
  });
  const createMutation = useCreateMenuItem();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      propertyId,
      ...form,
      price: Number(form.price),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Add Menu Item</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Item Name</label>
            <input
              className="input" required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Masala Dosa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {['breakfast','lunch','dinner','beverages','desserts','snacks','specials'].map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input
                className="input" type="number" required min="0"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="180"
              />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none" rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prep Time (min)</label>
              <input
                className="input" type="number" min="1"
                value={form.preparationTime}
                onChange={e => setForm({ ...form, preparationTime: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox" id="veg"
                checked={form.isVegetarian}
                onChange={e => setForm({ ...form, isVegetarian: e.target.checked })}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label htmlFor="veg" className="text-sm font-medium text-gray-700">Vegetarian</label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button className="flex-1" loading={createMutation.isPending} type="submit">
              Add Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Menu Item Card ──────────────────────────────────────────────────────────
const MenuItemCard = ({ item, propertyId }) => {
  const toggleMutation = useToggleItemAvailability();

  return (
    <div className={`card p-4 transition-opacity ${!item.isAvailable ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 text-sm">{item.name}</span>
            {item.isVegetarian && (
              <span className="h-4 w-4 rounded-full border-2 border-green-500 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-green-500" />
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-1">{item.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-bold text-gray-900">₹{item.price}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.preparationTime}m
            </span>
          </div>
        </div>
        <button
          onClick={() => toggleMutation.mutate({ propertyId, itemId: item._id })}
          disabled={toggleMutation.isPending}
          className={`ml-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            item.isAvailable ? 'bg-primary-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            item.isAvailable ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  );
};

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function RestaurantDashboard() {
  const { user }     = useAuthStore();
  const propertyId   = user?.propertyId || '69d6817ab880abc410462b20';
  const [activeTab,  setActiveTab]  = useState('kitchen');
  const [showAddItem, setShowAddItem] = useState(false);
  const [menuSearch,  setMenuSearch]  = useState('');
  const [menuCategory, setMenuCategory] = useState('all');

  const { data: liveOrders, isLoading: ordersLoading, refetch } = useLiveOrders(propertyId);
  const { data: menuData,   isLoading: menuLoading }             = useMenu(propertyId);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = ({ orderId, status }) => {
    updateStatusMutation.mutate({ propertyId, orderId, status });
  };

  // Group live orders by status
  const groupedOrders = (liveOrders || []).reduce((acc, order) => {
    if (!acc[order.status]) acc[order.status] = [];
    acc[order.status].push(order);
    return acc;
  }, {});

  // Filter menu
  const allItems = Object.values(menuData?.menu || {}).flat();
  const filteredItems = allItems.filter(item => {
    const matchesSearch   = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = menuCategory === 'all' || item.category === menuCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Object.keys(menuData?.menu || {})];

  const tabs = [
    { key: 'kitchen', label: `Kitchen (${liveOrders?.length || 0})`, icon: ChefHat },
    { key: 'menu',    label: `Menu (${allItems.length})`,            icon: UtensilsCrossed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant</h1>
          <p className="text-gray-500 mt-1">Kitchen display and menu management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </button>
          {activeTab === 'menu' && (
            <Button onClick={() => setShowAddItem(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'New Orders',    value: groupedOrders.placed?.length    || 0, color: 'bg-red-50 text-red-700',    icon: AlertCircle },
          { label: 'Confirmed',     value: groupedOrders.confirmed?.length || 0, color: 'bg-blue-50 text-blue-700',  icon: Circle      },
          { label: 'Preparing',     value: groupedOrders.preparing?.length || 0, color: 'bg-yellow-50 text-yellow-700', icon: ChefHat   },
          { label: 'Ready',         value: groupedOrders.ready?.length     || 0, color: 'bg-green-50 text-green-700', icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-4">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Kitchen Display */}
      {activeTab === 'kitchen' && (
        ordersLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (liveOrders || []).length === 0 ? (
          <div className="card p-12 text-center">
            <ChefHat className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No active orders</h3>
            <p className="text-gray-500">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(liveOrders || []).map(order => (
              <LiveOrderCard
                key={order._id}
                order={order}
                onUpdate={handleUpdateStatus}
                isUpdating={updateStatusMutation.isPending}
              />
            ))}
          </div>
        )
      )}

      {/* Menu Management */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                className="input pl-9"
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setMenuCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize transition-colors ${
                    menuCategory === cat
                      ? 'bg-primary-700 text-white'
                      : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {menuLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : filteredItems.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <Utensils className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No menu items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <MenuItemCard key={item._id} item={item} propertyId={propertyId} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add menu item modal */}
      {showAddItem && (
        <AddMenuItemModal
          propertyId={propertyId}
          onClose={() => setShowAddItem(false)}
        />
      )}
    </div>
  );
}