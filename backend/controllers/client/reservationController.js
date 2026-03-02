const Reservation = require('../../models/Reservation');
const paginate = require('../../utils/pagination');

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
