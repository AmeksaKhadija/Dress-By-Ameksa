const Tenue = require('../../models/Tenue');
const paginate = require('../../utils/pagination');

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

// @desc    Get all tenues with filters, search, pagination
// @route   GET /api/public/tenues
exports.getTenues = async (req, res, next) => {
  try {
    const { type, couleur, taille, prixMin, prixMax, search, page, limit } = req.query;
    const query = { disponible: true };

    if (type) query.type = type;
    if (couleur) query.couleurs = { $in: [couleur] };
    if (taille) query.tailles = { $in: [taille] };
    if (prixMin || prixMax) {
      query.prix = {};
      if (prixMin) query.prix.$gte = Number(prixMin);
      if (prixMax) query.prix.$lte = Number(prixMax);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const result = await paginate(Tenue, query, {
      page,
      limit,
      populate: 'boutique',
    });

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
