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
  createReservation,
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
const {
  generateTryOn,
  getMyTryOns,
  getTryOnById,
  deleteTryOn,
} = require('../controllers/client/tryonController');

router.use(protect);
router.use(authorize('client'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Reservations
router.post('/reservations', createReservation);
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

// TryOn 3D
router.post('/tryon', generateTryOn);
router.get('/tryon', getMyTryOns);
router.get('/tryon/:id', getTryOnById);
router.delete('/tryon/:id', deleteTryOn);

module.exports = router;
