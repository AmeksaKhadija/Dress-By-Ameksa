const Boutique = require('../../models/Boutique');
const Tenue = require('../../models/Tenue');
const Reservation = require('../../models/Reservation');
const { cloudinary } = require('../../config/cloudinary');

// @desc    Get vendeur's boutique
// @route   GET /api/vendeur/boutique
exports.getMyBoutique = async (req, res, next) => {
  try {
    const boutique = await Boutique.findOne({ vendeur: req.user._id });

    if (!boutique) {
      return res.json({ success: true, boutique: null });
    }

    const nbTenues = await Tenue.countDocuments({ boutique: boutique._id });
    const tenueIds = await Tenue.find({ boutique: boutique._id }).distinct('_id');

    const [nbReservations, revenueAgg, tenues] = await Promise.all([
      Reservation.countDocuments({ tenue: { $in: tenueIds } }),
      Reservation.aggregate([
        { $match: { tenue: { $in: tenueIds }, statut: { $in: ['confirmee', 'terminee'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$prixTotal' }, nbReservationsPayees: { $sum: 1 } } },
      ]),
      Tenue.find({ boutique: boutique._id }).select('nom type prix images disponible'),
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const nbReservationsPayees = revenueAgg[0]?.nbReservationsPayees || 0;
    const commission = Math.round(totalRevenue * 0.15);
    const gainsVendeur = totalRevenue - commission;

    res.json({
      success: true,
      boutique,
      stats: { nbTenues, nbReservations, totalRevenue, commission, gainsVendeur, nbReservationsPayees, tenues },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a boutique
// @route   POST /api/vendeur/boutique
exports.createBoutique = async (req, res, next) => {
  try {
    const existing = await Boutique.findOne({ vendeur: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vous avez deja une boutique' });
    }

    const { nom, description, adresse } = req.body;

    if (!nom || !description) {
      return res.status(400).json({ success: false, message: 'Nom et description sont requis' });
    }

    const boutiqueData = {
      nom,
      description,
      adresse,
      vendeur: req.user._id,
    };

    if (req.file) {
      boutiqueData.logo = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const boutique = await Boutique.create(boutiqueData);

    res.status(201).json({
      success: true,
      message: 'Boutique creee avec succes. En attente de validation.',
      boutique,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendeur's boutique
// @route   PUT /api/vendeur/boutique
exports.updateBoutique = async (req, res, next) => {
  try {
    const boutique = await Boutique.findOne({ vendeur: req.user._id });
    if (!boutique) {
      return res.status(404).json({ success: false, message: 'Boutique non trouvee' });
    }

    const { nom, description, adresse } = req.body;
    if (nom) boutique.nom = nom;
    if (description) boutique.description = description;
    if (adresse !== undefined) boutique.adresse = adresse;

    if (req.file) {
      if (boutique.logo && boutique.logo.public_id) {
        await cloudinary.uploader.destroy(boutique.logo.public_id).catch(() => {});
      }
      boutique.logo = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await boutique.save();

    res.json({
      success: true,
      message: 'Boutique mise a jour',
      boutique,
    });
  } catch (error) {
    next(error);
  }
};
