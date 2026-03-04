const Tenue = require('../../models/Tenue');
const Boutique = require('../../models/Boutique');
const Reservation = require('../../models/Reservation');
const { cloudinary } = require('../../config/cloudinary');
const paginate = require('../../utils/pagination');

const getVendeurBoutique = async (userId, requireValidee = false) => {
  const boutique = await Boutique.findOne({ vendeur: userId });
  if (!boutique) {
    const err = new Error('Vous devez d\'abord creer une boutique');
    err.statusCode = 400;
    throw err;
  }
  if (requireValidee && boutique.statut !== 'validee') {
    const err = new Error('Votre boutique n\'est pas encore validee');
    err.statusCode = 403;
    throw err;
  }
  return boutique;
};

// @desc    Get vendeur's tenues
// @route   GET /api/vendeur/tenues
exports.getMyTenues = async (req, res, next) => {
  try {
    const boutique = await getVendeurBoutique(req.user._id);
    const filter = { boutique: boutique._id };
    if (req.query.archivee === 'true') {
      filter.archivee = true;
    } else {
      filter.archivee = { $ne: true };
    }
    const { results, pagination } = await paginate(
      Tenue,
      filter,
      { page: req.query.page, limit: req.query.limit }
    );
    res.json({ success: true, tenues: results, pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tenue
// @route   GET /api/vendeur/tenues/:id
exports.getMyTenueById = async (req, res, next) => {
  try {
    const boutique = await getVendeurBoutique(req.user._id);
    const tenue = await Tenue.findOne({ _id: req.params.id, boutique: boutique._id });
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue non trouvee' });
    }
    res.json({ success: true, tenue });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a tenue
// @route   POST /api/vendeur/tenues
exports.createTenue = async (req, res, next) => {
  try {
    const boutique = await getVendeurBoutique(req.user._id, true);
    const { nom, type, description, prix, tailles, couleurs, disponible } = req.body;

    if (!nom || !type || !description || !prix) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }

    const tenueData = {
      nom,
      type,
      description,
      prix: Number(prix),
      tailles: tailles ? JSON.parse(tailles) : [],
      couleurs: couleurs ? JSON.parse(couleurs) : [],
      disponible: disponible !== undefined ? disponible === 'true' : true,
      boutique: boutique._id,
    };

    if (req.files && req.files.length > 0) {
      tenueData.images = req.files.map((f) => ({
        url: f.path,
        public_id: f.filename,
      }));
    }

    const tenue = await Tenue.create(tenueData);
    res.status(201).json({ success: true, message: 'Tenue ajoutee', tenue });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a tenue
// @route   PUT /api/vendeur/tenues/:id
exports.updateTenue = async (req, res, next) => {
  try {
    const boutique = await getVendeurBoutique(req.user._id);
    const tenue = await Tenue.findOne({ _id: req.params.id, boutique: boutique._id });
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue non trouvee' });
    }

    const { nom, type, description, prix, tailles, couleurs, disponible } = req.body;
    if (nom) tenue.nom = nom;
    if (type) tenue.type = type;
    if (description) tenue.description = description;
    if (prix) tenue.prix = Number(prix);
    if (tailles) tenue.tailles = JSON.parse(tailles);
    if (couleurs) tenue.couleurs = JSON.parse(couleurs);
    if (disponible !== undefined) tenue.disponible = disponible === 'true' || disponible === true;

    if (req.files && req.files.length > 0) {
      // Delete old images from cloudinary
      for (const img of tenue.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id).catch(() => {});
        }
      }
      tenue.images = req.files.map((f) => ({
        url: f.path,
        public_id: f.filename,
      }));
    }

    await tenue.save();
    res.json({ success: true, message: 'Tenue mise a jour', tenue });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a tenue (blocks if active reservations, otherwise archives)
// @route   DELETE /api/vendeur/tenues/:id
exports.deleteTenue = async (req, res, next) => {
  try {
    const boutique = await getVendeurBoutique(req.user._id);
    const tenue = await Tenue.findOne({ _id: req.params.id, boutique: boutique._id, archivee: { $ne: true } });
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue non trouvee' });
    }

    // Check for active reservations (en_attente or confirmee)
    const activeReservations = await Reservation.countDocuments({
      tenue: tenue._id,
      statut: { $in: ['en_attente', 'confirmee'] },
    });

    if (activeReservations > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer cette tenue, elle a ${activeReservations} reservation(s) en cours.`,
      });
    }

    // Soft delete: always archive
    tenue.archivee = true;
    tenue.disponible = false;
    await tenue.save();
    res.json({ success: true, message: 'Tenue archivee', archivee: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete an archived tenue
// @route   DELETE /api/vendeur/tenues/:id/permanent
exports.permanentDeleteTenue = async (req, res, next) => {
  try {
    const boutique = await getVendeurBoutique(req.user._id);
    const tenue = await Tenue.findOne({ _id: req.params.id, boutique: boutique._id, archivee: true });
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue archivee non trouvee' });
    }

    for (const img of tenue.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id).catch(() => {});
      }
    }

    await tenue.deleteOne();
    res.json({ success: true, message: 'Tenue supprimee definitivement' });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore an archived tenue
// @route   PATCH /api/vendeur/tenues/:id/restore
exports.restoreTenue = async (req, res, next) => {
  try {
    const boutique = await getVendeurBoutique(req.user._id);
    const tenue = await Tenue.findOne({ _id: req.params.id, boutique: boutique._id, archivee: true });
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue archivee non trouvee' });
    }

    tenue.archivee = false;
    tenue.disponible = true;
    await tenue.save();
    res.json({ success: true, message: 'Tenue restauree', tenue });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle tenue availability
// @route   PATCH /api/vendeur/tenues/:id/disponibilite
exports.toggleDisponibilite = async (req, res, next) => {
  try {
    const boutique = await getVendeurBoutique(req.user._id);
    const tenue = await Tenue.findOne({ _id: req.params.id, boutique: boutique._id });
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue non trouvee' });
    }

    tenue.disponible = req.body.disponible;
    await tenue.save();
    res.json({ success: true, message: `Tenue ${tenue.disponible ? 'disponible' : 'indisponible'}`, tenue });
  } catch (error) {
    next(error);
  }
};
