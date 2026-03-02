const User = require('../../models/User');
const generateToken = require('../../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { nom, email, motDePasse, role, telephone, adresse } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Cet email est deja utilise' });
    }

    if (role && !['client', 'vendeur'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role invalide' });
    }

    const user = await User.create({ nom, email, motDePasse, role, telephone, adresse });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Compte cree avec succes',
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
