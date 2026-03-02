const Reservation = require('../../models/Reservation');
const Tenue = require('../../models/Tenue');
const Boutique = require('../../models/Boutique');
const User = require('../../models/User');
const paginate = require('../../utils/pagination');
const sendEmail = require('../../utils/email');
const { reservationStatusTemplate } = require('../../utils/emailTemplates');

const getVendeurTenueIds = async (userId) => {
  const boutique = await Boutique.findOne({ vendeur: userId });
  if (!boutique) {
    const err = new Error('Boutique non trouvee');
    err.statusCode = 404;
    throw err;
  }
  return Tenue.find({ boutique: boutique._id }).distinct('_id');
};

// @desc    Get vendeur's reservations
// @route   GET /api/vendeur/reservations
exports.getMyReservations = async (req, res, next) => {
  try {
    const tenueIds = await getVendeurTenueIds(req.user._id);
    const query = { tenue: { $in: tenueIds } };

    if (req.query.statut) {
      query.statut = req.query.statut;
    }

    const { results, pagination } = await paginate(
      Reservation,
      query,
      {
        page: req.query.page,
        limit: req.query.limit,
        populate: [
          { path: 'client', select: 'nom email telephone' },
          { path: 'tenue', select: 'nom images prix type' },
        ],
      }
    );

    res.json({ success: true, reservations: results, pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation
// @route   GET /api/vendeur/reservations/:id
exports.getMyReservationById = async (req, res, next) => {
  try {
    const tenueIds = await getVendeurTenueIds(req.user._id);
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      tenue: { $in: tenueIds },
    })
      .populate('client', 'nom email telephone adresse')
      .populate('tenue', 'nom images prix type');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation non trouvee' });
    }

    res.json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status (accept/refuse)
// @route   PUT /api/vendeur/reservations/:id/statut
exports.updateReservationStatut = async (req, res, next) => {
  try {
    const { statut } = req.body;
    const tenueIds = await getVendeurTenueIds(req.user._id);
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      tenue: { $in: tenueIds },
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation non trouvee' });
    }

    // Validate transitions
    const transitions = {
      en_attente: ['confirmee', 'annulee'],
      confirmee: ['annulee'],
    };

    const allowed = transitions[reservation.statut];
    if (!allowed || !allowed.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `Transition de "${reservation.statut}" vers "${statut}" non autorisee`,
      });
    }

    reservation.statut = statut;
    await reservation.save();

    // Send email notification to client
    const client = await User.findById(reservation.client);
    const tenue = await Tenue.findById(reservation.tenue);
    if (client?.email && tenue) {
      const html = reservationStatusTemplate({
        clientNom: client.nom,
        tenueNom: tenue.nom,
        statut,
      });
      sendEmail({
        to: client.email,
        subject: `Reservation ${statut === 'confirmee' ? 'confirmee' : 'annulee'} - Dress by Ameksa`,
        html,
      });
    }

    res.json({
      success: true,
      message: statut === 'confirmee' ? 'Reservation acceptee' : 'Reservation refusee',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark reservation as returned
// @route   PUT /api/vendeur/reservations/:id/retour
exports.markAsReturned = async (req, res, next) => {
  try {
    const tenueIds = await getVendeurTenueIds(req.user._id);
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      tenue: { $in: tenueIds },
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation non trouvee' });
    }

    if (reservation.statut !== 'confirmee') {
      return res.status(400).json({ success: false, message: 'Seule une reservation confirmee peut etre marquee comme retournee' });
    }

    reservation.statut = 'terminee';
    await reservation.save();

    res.json({ success: true, message: 'Retour enregistre', reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle dispute
// @route   PUT /api/vendeur/reservations/:id/litige
exports.handleLitige = async (req, res, next) => {
  try {
    const { litige, commentaireLitige } = req.body;
    const tenueIds = await getVendeurTenueIds(req.user._id);
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      tenue: { $in: tenueIds },
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation non trouvee' });
    }

    reservation.litige = litige;
    reservation.commentaireLitige = commentaireLitige || '';
    await reservation.save();

    res.json({
      success: true,
      message: litige ? 'Litige signale' : 'Litige resolu',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};
