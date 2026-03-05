const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  getAllBoutiques,
  updateBoutiqueStatut,
} = require('../controllers/admin/boutiqueController');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  approveVendeur,
  deleteUser,
} = require('../controllers/admin/userController');
const {
  getAllReservations,
  getReservationById,
  resolverLitige,
} = require('../controllers/admin/reservationController');
const {
  getDashboardStats,
  getCommissions,
} = require('../controllers/admin/adminController');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/client/clientController');

router.use(protect);
router.use(authorize('admin'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

// Dashboard & Stats
router.get('/stats', getDashboardStats);
router.get('/commissions', getCommissions);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/approve', approveVendeur);
router.delete('/users/:id', deleteUser);

// Boutiques management
router.get('/boutiques', getAllBoutiques);
router.put('/boutiques/:id/statut', updateBoutiqueStatut);

// Reservations management
router.get('/reservations', getAllReservations);
router.get('/reservations/:id', getReservationById);
router.put('/reservations/:id/litige', resolverLitige);

module.exports = router;
