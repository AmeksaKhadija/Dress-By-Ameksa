const User = require('../../models/User');
const Boutique = require('../../models/Boutique');
const paginate = require('../../utils/pagination');
const createNotification = require('../../utils/createNotification');

// @desc    Get all users with filters
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const { results, pagination } = await paginate(User, query, {
      page: req.query.page,
      limit: req.query.limit || 10,
    });

    res.json({ success: true, users: results, pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
    }

    let boutique = null;
    if (user.role === 'vendeur') {
      boutique = await Boutique.findOne({ vendeur: user._id });
    }

    res.json({ success: true, user, boutique });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['client', 'vendeur', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role invalide' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas modifier votre propre role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
    }

    res.json({ success: true, message: 'Role mis a jour', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve vendeur account
// @route   PUT /api/admin/users/:id/approve
exports.approveVendeur = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
    }

    if (user.role !== 'vendeur') {
      return res.status(400).json({ success: false, message: 'Cet utilisateur n\'est pas un vendeur' });
    }

    if (user.statut === 'actif') {
      return res.status(400).json({ success: false, message: 'Ce vendeur est deja approuve' });
    }

    user.statut = 'actif';
    await user.save();

    createNotification({
      utilisateur: user._id,
      type: 'compte_approuve',
      titre: 'Compte approuve',
      message: 'Votre compte vendeur a ete approuve par l\'administrateur. Vous pouvez maintenant gerer votre boutique.',
      lien: '/vendeur/dashboard',
    });

    res.json({ success: true, message: 'Vendeur approuve avec succes', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
    }

    res.json({ success: true, message: 'Utilisateur supprime' });
  } catch (error) {
    next(error);
  }
};
