const Tenue = require('../../models/Tenue');
const Boutique = require('../../models/Boutique');
const Reservation = require('../../models/Reservation');
const paginate = require('../../utils/pagination');

// @desc    Get popular/recent tenues
// @route   GET /api/public/tenues/popular
exports.getPopularTenues = async (req, res, next) => {
  try {
    const tenues = await Tenue.find({ disponible: true, archivee: { $ne: true } })
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
    const query = { disponible: true, archivee: { $ne: true } };

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

// @desc    Get single tenue by ID
// @route   GET /api/public/tenues/:id
exports.getTenueById = async (req, res, next) => {
  try {
    const tenue = await Tenue.findById(req.params.id).populate('boutique', 'nom description logo');
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue non trouvee' });
    }

    // Check availability by checking active reservations
    const reservations = await Reservation.find({
      tenue: tenue._id,
      statut: { $in: ['en_attente', 'confirmee'] },
      dateFin: { $gte: new Date() },
    }).select('dateDebut dateFin taille couleur');

    res.json({ success: true, tenue, reservations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar tenues
// @route   GET /api/public/tenues/:id/similar
exports.getSimilarTenues = async (req, res, next) => {
  try {
    const tenue = await Tenue.findById(req.params.id);
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue non trouvee' });
    }

    const similar = await Tenue.find({
      _id: { $ne: tenue._id },
      disponible: true,
      archivee: { $ne: true },
      $or: [{ type: tenue.type }, { boutique: tenue.boutique }],
    })
      .limit(4)
      .populate('boutique', 'nom');

    res.json({ success: true, tenues: similar });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all validated boutiques
// @route   GET /api/public/boutiques
exports.getBoutiques = async (req, res, next) => {
  try {
    const boutiques = await Boutique.find({ statut: 'validee' })
      .populate('vendeur', 'nom')
      .sort({ createdAt: -1 });

    res.json({ success: true, boutiques });
  } catch (error) {
    next(error);
  }
};

// @desc    Get boutique by ID with its tenues
// @route   GET /api/public/boutiques/:id
exports.getBoutiqueById = async (req, res, next) => {
  try {
    const boutique = await Boutique.findById(req.params.id).populate('vendeur', 'nom');
    if (!boutique) {
      return res.status(404).json({ success: false, message: 'Boutique non trouvee' });
    }

    const tenues = await Tenue.find({ boutique: boutique._id, disponible: true, archivee: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate('boutique', 'nom');

    res.json({ success: true, boutique, tenues });
  } catch (error) {
    next(error);
  }
};
