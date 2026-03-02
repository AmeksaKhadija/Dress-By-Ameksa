const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/client/clientController');

router.use(protect);
router.use(authorize('client'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

module.exports = router;
