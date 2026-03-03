const Reservation = require('../../models/Reservation');
const Tenue = require('../../models/Tenue');
const paginate = require('../../utils/pagination');
const createNotification = require('../../utils/createNotification');

// @desc    Create a reservation
// @route   POST /api/client/reservations
exports.createReservation = async (req, res, next) => {
  try {
    const { tenueId, dateDebut, dateFin, taille, couleur } = req.body;

    const tenue = await Tenue.findById(tenueId);
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue non trouvee' });
    }

    if (!tenue.disponible) {
      return res.status(400).json({ success: false, message: 'Cette tenue n\'est pas disponible' });
    }

    // Validate taille
    if (!taille || !tenue.tailles.includes(taille)) {
      return res.status(400).json({ success: false, message: 'Veuillez choisir une taille valide' });
    }

    // Validate couleur
    if (!couleur || !tenue.couleurs.includes(couleur)) {
      return res.status(400).json({ success: false, message: 'Veuillez choisir une couleur valide' });
    }

    const start = new Date(dateDebut);
    const end = new Date(dateFin);

    if (start > end) {
      return res.status(400).json({ success: false, message: 'La date de fin doit etre egale ou apres la date de debut' });
    }

    if (start < new Date()) {
      return res.status(400).json({ success: false, message: 'La date de debut doit etre dans le futur' });
    }

    // Check for overlapping reservations
    const overlap = await Reservation.findOne({
      tenue: tenueId,
      statut: { $in: ['en_attente', 'confirmee'] },
      $or: [
        { dateDebut: { $lte: end }, dateFin: { $gte: start } },
      ],
    });

    if (overlap) {
      return res.status(400).json({ success: false, message: 'Cette tenue est deja reservee pour ces dates' });
    }

    // Calculate price (minimum 1 day)
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const prixTotal = days * tenue.prix;

    const reservation = await Reservation.create({
      client: req.user._id,
      tenue: tenueId,
      dateDebut: start,
      dateFin: end,
      taille,
      couleur,
      prixTotal,
    });

    // Notify vendeur about new reservation
    const boutique = await require('../../models/Boutique').findById(tenue.boutique);
    if (boutique) {
      createNotification({
        utilisateur: boutique.vendeur,
        type: 'nouvelle_reservation',
        titre: 'Nouvelle reservation',
        message: `Nouvelle reservation pour "${tenue.nom}" du ${start.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}.`,
        lien: '/vendeur/reservations',
        reservation: reservation._id,
      });
    }

    res.status(201).json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get client's reservations
// @route   GET /api/client/reservations
exports.getMyReservations = async (req, res, next) => {
  try {
    const query = { client: req.user._id };
    if (req.query.statut) query.statut = req.query.statut;

    const { results, pagination } = await paginate(Reservation, query, {
      page: req.query.page,
      limit: req.query.limit,
      populate: [
        {
          path: 'tenue',
          select: 'nom images prix type boutique',
          populate: { path: 'boutique', select: 'nom' },
        },
      ],
    });

    res.json({ success: true, reservations: results, pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation
// @route   GET /api/client/reservations/:id
exports.getMyReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      client: req.user._id,
    }).populate({
      path: 'tenue',
      select: 'nom images prix type boutique',
      populate: { path: 'boutique', select: 'nom adresse' },
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation non trouvee' });
    }

    res.json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get client dashboard stats
// @route   GET /api/client/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [total, enAttente, confirmee, terminee] = await Promise.all([
      Reservation.countDocuments({ client: req.user._id }),
      Reservation.countDocuments({ client: req.user._id, statut: 'en_attente' }),
      Reservation.countDocuments({ client: req.user._id, statut: 'confirmee' }),
      Reservation.countDocuments({ client: req.user._id, statut: 'terminee' }),
    ]);

    res.json({ success: true, stats: { total, enAttente, confirmee, terminee } });
  } catch (error) {
    next(error);
  }
};
