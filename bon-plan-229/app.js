const STORAGE_KEY = "bon_plan_229_data_v1";

const defaultData = {
  announcements: [],
  users: [],
  orders: [],
  packs: [],
  boosts: [],
  transactions: [],
  commissions: []
};

let data = loadData();

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultData, ...JSON.parse(saved) } : { ...defaultData };
  } catch (error) {
    console.error("Erreur de chargement des données :", error);
    return { ...defaultData };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatPrice(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createAnnouncement(announcement) {
  const item = {
    id: generateId("ann"),
    title: announcement.title || "",
    description: announcement.description || "",
    category: announcement.category || "Autre",
    price: Number(announcement.price || 0),
    sellerId: announcement.sellerId || null,
    sellerName: announcement.sellerName || "",
    location: announcement.location || "",
    status: "active",
    createdAt: new Date().toISOString()
  };

  data.announcements.push(item);
  saveData();

  return item;
}

function updateAnnouncement(id, updates) {
  const item = data.announcements.find(a => a.id === id);

  if (!item) {
    return null;
  }

  Object.assign(item, updates, {
    updatedAt: new Date().toISOString()
  });

  saveData();
  return item;
}

function deleteAnnouncement(id) {
  data.announcements = data.announcements.filter(a => a.id !== id);
  saveData();
}

function searchAnnouncements(query = "", category = "") {
  const q = query.trim().toLowerCase();

  return data.announcements.filter(item => {
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);

    const matchesCategory =
      !category ||
      category === "Toutes" ||
      item.category === category;

    return matchesQuery && matchesCategory && item.status === "active";
  });
}

function createUser(user) {
  const item = {
    id: generateId("usr"),
    name: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    role: user.role || "user",
    createdAt: new Date().toISOString()
  };

  data.users.push(item);
  saveData();

  return item;
}

function createOrder(order) {
  const item = {
    id: generateId("ord"),
    announcementId: order.announcementId || null,
    buyerId: order.buyerId || null,
    sellerId: order.sellerId || null,
    amount: Number(order.amount || 0),
    commission: Number(order.commission || 0),
    sellerNet: Number(order.sellerNet || 0),
    status: "pending",
    paymentStatus: "pending",
    deliveryStatus: "pending",
    createdAt: new Date().toISOString()
  };

  data.orders.push(item);
  saveData();

  return item;
}

function updateOrder(id, updates) {
  const order = data.orders.find(item => item.id === id);

  if (!order) {
    return null;
  }

  Object.assign(order, updates);
  saveData();

  return order;
}

function createPack(pack) {
  const item = {
    id: generateId("pack"),
    name: pack.name || "",
    description: pack.description || "",
    price: Number(pack.price || 0),
    durationDays: Number(pack.durationDays || 30),
    active: true,
    createdAt: new Date().toISOString()
  };

  data.packs.push(item);
  saveData();

  return item;
}

function createBoost(boost) {
  const item = {
    id: generateId("boost"),
    announcementId: boost.announcementId || null,
    packId: boost.packId || null,
    amount: Number(boost.amount || 0),
    status: "pending",
    createdAt: new Date().toISOString()
  };

  data.boosts.push(item);
  saveData();

  return item;
}

function createTransaction(transaction) {
  const item = {
    id: generateId("txn"),
    orderId: transaction.orderId || null,
    type: transaction.type || "payment",
    amount: Number(transaction.amount || 0),
    status: transaction.status || "pending",
    provider: transaction.provider || "",
    createdAt: new Date().toISOString()
  };

  data.transactions.push(item);
  saveData();

  return item;
}

function calculateCommission(amount, rate = 0) {
  return Math.round(Number(amount || 0) * Number(rate || 0) / 100);
}

function calculateSellerNet(amount, commission) {
  return Math.max(0, Number(amount || 0) - Number(commission || 0));
}

function getDashboardStats() {
  return {
    announcements: data.announcements.length,
    users: data.users.length,
    orders: data.orders.length,
    boosts: data.boosts.length,
    transactions: data.transactions.length
  };
}

function resetLocalData() {
  localStorage.removeItem(STORAGE_KEY);
  data = { ...defaultData };
  window.location.reload();
}

window.BonPlan229 = {
  data,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  searchAnnouncements,
  createUser,
  createOrder,
  updateOrder,
  createPack,
  createBoost,
  createTransaction,
  calculateCommission,
  calculateSellerNet,
  getDashboardStats,
  formatPrice,
  resetLocalData
};

document.addEventListener("DOMContentLoaded", () => {
  document.dispatchEvent(
    new CustomEvent("bonplan229:ready", {
      detail: {
        stats: getDashboardStats()
      }
    })
  );
});
