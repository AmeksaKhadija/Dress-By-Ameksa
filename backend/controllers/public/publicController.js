const Tenue = require('../../models/Tenue');

// @desc    Get popular/recent tenues
// @route   GET /api/public/tenues/popular
exports.getPopularTenues = async (req, res, next) => {
  try {
    const tenues = await Tenue.find({ disponible: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('boutique', 'nom');

    res.json({ success: true, tenues });
  } catch (error) {
    next(error);
  }
};
