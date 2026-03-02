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

module.exports = router;
