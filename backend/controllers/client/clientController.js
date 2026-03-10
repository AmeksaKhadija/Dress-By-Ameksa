const User = require('../../models/User');

// @desc    Get client profile
// @route   GET /api/client/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client profile
// @route   PUT /api/client/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { nom, telephone, adresse } = req.body;

    if (nom !== undefined && nom.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Le nom ne peut pas etre vide' });
    }

    const updateFields = {};
    if (nom !== undefined) updateFields.nom = nom.trim();
    if (telephone !== undefined) updateFields.telephone = telephone.trim();
    if (adresse !== undefined) updateFields.adresse = adresse.trim();

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profil mis a jour', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/client/profile/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caracteres' });
    }

    const user = await User.findById(req.user._id).select('+motDePasse');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    user.motDePasse = newPassword;
    await user.save();

    res.json({ success: true, message: 'Mot de passe modifie avec succes' });
  } catch (error) {
    next(error);
  }
};
