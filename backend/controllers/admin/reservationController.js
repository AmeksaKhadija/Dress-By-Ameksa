const Reservation = require('../../models/Reservation');
const paginate = require('../../utils/pagination');

// @desc    Get all reservations (platform-wide)
// @route   GET /api/admin/reservations
exports.getAllReservations = async (req, res, next) => {
  try {
    const { statut, litige } = req.query;
    const query = {};
    if (statut) query.statut = statut;
    if (litige === 'true') query.litige = true;

    const { results, pagination } = await paginate(Reservation, query, {
      page: req.query.page,
      limit: req.query.limit || 10,
      populate: [
        { path: 'client', select: 'nom email telephone' },
        { path: 'tenue', select: 'nom images prix type boutique', populate: { path: 'boutique', select: 'nom' } },
      ],
    });

    res.json({ success: true, reservations: results, pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation detail
// @route   GET /api/admin/reservations/:id
exports.getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client', 'nom email telephone adresse')
      .populate({
        path: 'tenue',
        select: 'nom images prix type boutique',
        populate: { path: 'boutique', select: 'nom vendeur', populate: { path: 'vendeur', select: 'nom email' } },
      });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation non trouvee' });
    }

    res.json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve or flag a dispute
// @route   PUT /api/admin/reservations/:id/litige
exports.resolverLitige = async (req, res, next) => {
  try {
    const { litige, commentaireLitige } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation non trouvee' });
    }

    reservation.litige = litige;
    reservation.commentaireLitige = commentaireLitige || '';
    await reservation.save();

    res.json({ success: true, message: litige ? 'Litige signale' : 'Litige resolu', reservation });
  } catch (error) {
    next(error);
  }
};
