const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const vendeurApproved = require('../middleware/vendeurApproved.middleware');
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const {
  getMyBoutique,
  createBoutique,
  updateBoutique,
} = require('../controllers/vendeur/boutiqueController');
const {
  getMyTenues,
  getMyTenueById,
  createTenue,
  updateTenue,
  deleteTenue,
  permanentDeleteTenue,
  restoreTenue,
  toggleDisponibilite,
} = require('../controllers/vendeur/tenueController');
const {
  getMyReservations,
  getMyReservationById,
  updateReservationStatut,
  markAsReturned,
  handleLitige,
} = require('../controllers/vendeur/reservationController');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/client/clientController');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/client/notificationController');

router.use(protect);
router.use(authorize('vendeur'));

// Boutique
router.get('/boutique', getMyBoutique);
router.post('/boutique', vendeurApproved, uploadSingle, createBoutique);
router.put('/boutique', vendeurApproved, uploadSingle, updateBoutique);

// Tenues
router.get('/tenues', getMyTenues);
router.get('/tenues/:id', getMyTenueById);
router.post('/tenues', vendeurApproved, uploadMultiple, createTenue);
router.put('/tenues/:id', vendeurApproved, uploadMultiple, updateTenue);
router.delete('/tenues/:id', vendeurApproved, deleteTenue);
router.delete('/tenues/:id/permanent', vendeurApproved, permanentDeleteTenue);
router.patch('/tenues/:id/restore', vendeurApproved, restoreTenue);
router.patch('/tenues/:id/disponibilite', vendeurApproved, toggleDisponibilite);

// Reservations
router.get('/reservations', getMyReservations);
router.get('/reservations/:id', getMyReservationById);
router.put('/reservations/:id/statut', vendeurApproved, updateReservationStatut);
router.put('/reservations/:id/retour', vendeurApproved, markAsReturned);
router.put('/reservations/:id/litige', vendeurApproved, handleLitige);

// Notifications
router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.put('/notifications/lire-tout', markAllAsRead);
router.put('/notifications/:id/lire', markAsRead);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

module.exports = router;
