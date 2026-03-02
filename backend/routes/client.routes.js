const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/client/clientController');
const {
  createCheckoutSession,
  verifyPayment,
} = require('../controllers/client/paiementController');
const {
  getMyReservations,
  getMyReservationById,
  getDashboardStats,
} = require('../controllers/client/reservationController');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/client/notificationController');

router.use(protect);
router.use(authorize('client'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Reservations
router.get('/reservations', getMyReservations);
router.get('/reservations/:id', getMyReservationById);

// Paiement
router.post('/paiement/checkout/:reservationId', createCheckoutSession);
router.get('/paiement/verify/:sessionId', verifyPayment);

// Notifications
router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.put('/notifications/lire-tout', markAllAsRead);
router.put('/notifications/:id/lire', markAsRead);

module.exports = router;
