const User = require('../../models/User');
const Boutique = require('../../models/Boutique');
const Reservation = require('../../models/Reservation');
const Paiement = require('../../models/Paiement');

const COMMISSION_RATE = 0.15;

// @desc    Get platform dashboard stats
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      clientCount,
      vendeurCount,
      adminCount,
      totalBoutiques,
      boutiquesEnAttente,
      boutiquesValidees,
      boutiquesSuspendues,
      totalReservations,
      reservationsEnAttente,
      reservationsConfirmees,
      reservationsTerminees,
      reservationsAnnulees,
      reservationsLitiges,
      revenueResult,
      recentReservations,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'vendeur' }),
      User.countDocuments({ role: 'admin' }),
      Boutique.countDocuments(),
      Boutique.countDocuments({ statut: 'en_attente' }),
      Boutique.countDocuments({ statut: 'validee' }),
      Boutique.countDocuments({ statut: 'suspendue' }),
      Reservation.countDocuments(),
      Reservation.countDocuments({ statut: 'en_attente' }),
      Reservation.countDocuments({ statut: 'confirmee' }),
      Reservation.countDocuments({ statut: 'terminee' }),
      Reservation.countDocuments({ statut: 'annulee' }),
      Reservation.countDocuments({ litige: true }),
      Paiement.aggregate([
        { $match: { statut: 'reussi' } },
        { $group: { _id: null, total: { $sum: '$montant' } } },
      ]),
      Reservation.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'nom')
        .populate('tenue', 'nom'),
      User.find().sort({ createdAt: -1 }).limit(5).select('nom email role createdAt'),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalCommissions = totalRevenue * COMMISSION_RATE;

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, clients: clientCount, vendeurs: vendeurCount, admins: adminCount },
        boutiques: { total: totalBoutiques, en_attente: boutiquesEnAttente, validees: boutiquesValidees, suspendues: boutiquesSuspendues },
        reservations: { total: totalReservations, en_attente: reservationsEnAttente, confirmees: reservationsConfirmees, terminees: reservationsTerminees, annulees: reservationsAnnulees, litiges: reservationsLitiges },
        revenue: { total: totalRevenue, commissions: totalCommissions, commissionRate: COMMISSION_RATE },
        recent: { reservations: recentReservations, users: recentUsers },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get commission details per boutique
// @route   GET /api/admin/commissions
exports.getCommissions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const basePipeline = [
      { $match: { statut: 'reussi' } },
      { $lookup: { from: 'reservations', localField: 'reservation', foreignField: '_id', as: 'reservation' } },
      { $unwind: '$reservation' },
      { $lookup: { from: 'tenues', localField: 'reservation.tenue', foreignField: '_id', as: 'tenue' } },
      { $unwind: '$tenue' },
      { $lookup: { from: 'boutiques', localField: 'tenue.boutique', foreignField: '_id', as: 'boutique' } },
      { $unwind: '$boutique' },
      {
        $group: {
          _id: '$boutique._id',
          boutiqueNom: { $first: '$boutique.nom' },
          totalPaiements: { $sum: '$montant' },
          nbReservations: { $sum: 1 },
        },
      },
      {
        $addFields: {
          commission: { $multiply: ['$totalPaiements', COMMISSION_RATE] },
          montantBoutique: { $multiply: ['$totalPaiements', 1 - COMMISSION_RATE] },
        },
      },
      { $sort: { totalPaiements: -1 } },
    ];

    const [commissions, countResult, summaryResult] = await Promise.all([
      Paiement.aggregate([...basePipeline, { $skip: skip }, { $limit: limit }]),
      Paiement.aggregate([...basePipeline, { $count: 'total' }]),
      Paiement.aggregate([
        { $match: { statut: 'reussi' } },
        { $group: { _id: null, total: { $sum: '$montant' } } },
      ]),
    ]);

    const total = countResult[0]?.total || 0;
    const totalRevenue = summaryResult[0]?.total || 0;
    const totalCommissions = totalRevenue * COMMISSION_RATE;

    res.json({
      success: true,
      commissions,
      summary: { totalRevenue, totalCommissions, commissionRate: COMMISSION_RATE },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
