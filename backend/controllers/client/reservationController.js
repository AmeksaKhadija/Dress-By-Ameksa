const Reservation = require('../../models/Reservation');
const Tenue = require('../../models/Tenue');
const Paiement = require('../../models/Paiement');
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

    // Check which reservations have been paid
    const reservationIds = results.map((r) => r._id);
    const paiements = await Paiement.find({
      reservation: { $in: reservationIds },
      statut: 'reussi',
    }).select('reservation');
    const paidSet = new Set(paiements.map((p) => p.reservation.toString()));

    const reservations = results.map((r) => {
      const obj = r.toObject();
      obj.paiementEffectue = paidSet.has(r._id.toString());
      return obj;
    });

    // Check for overdue reservations and create reminder notifications
    const now = new Date();
    for (const r of results) {
      const isPaid = paidSet.has(r._id.toString());
      if (
        r.statut === 'confirmee' &&
        isPaid &&
        new Date(r.dateFin) < now &&
        !r.retourSignale &&
        !r.notificationRetourEnvoyee
      ) {
        createNotification({
          utilisateur: req.user._id,
          type: 'rappel_retour',
          titre: 'Rappel de retour',
          message: `La date de fin de votre reservation pour "${r.tenue?.nom || 'une tenue'}" est passee. Pensez a retourner la tenue.`,
          lien: '/client/reservations',
          reservation: r._id,
        });
        Reservation.updateOne({ _id: r._id }, { notificationRetourEnvoyee: true }).exec();
      }
    }

    res.json({ success: true, reservations, pagination });
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

// @desc    Signal return of outfit to vendeur
// @route   PUT /api/client/reservations/:id/signaler-retour
exports.signalerRetour = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      client: req.user._id,
    }).populate({
      path: 'tenue',
      select: 'nom boutique',
      populate: { path: 'boutique', select: 'vendeur' },
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation non trouvee' });
    }

    if (reservation.statut !== 'confirmee') {
      return res.status(400).json({ success: false, message: 'Seule une reservation confirmee peut etre signalee comme retournee' });
    }

    const paiement = await Paiement.findOne({ reservation: reservation._id, statut: 'reussi' });
    if (!paiement) {
      return res.status(400).json({ success: false, message: 'Le paiement doit etre effectue avant de signaler le retour' });
    }

    if (reservation.retourSignale) {
      return res.status(400).json({ success: false, message: 'Le retour a deja ete signale' });
    }

    reservation.retourSignale = true;
    await reservation.save();

    const vendeurId = reservation.tenue?.boutique?.vendeur;
    if (vendeurId) {
      createNotification({
        utilisateur: vendeurId,
        type: 'retour_signale',
        titre: 'Retour signale par le client',
        message: `Le client a signale le retour de la tenue "${reservation.tenue?.nom || 'une tenue'}". Veuillez confirmer le retour.`,
        lien: '/vendeur/reservations',
        reservation: reservation._id,
      });
    }

    res.json({ success: true, message: 'Retour signale avec succes' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit star rating for reservation
// @route   PUT /api/client/reservations/:id/temoignage
exports.soumettreTemoignage = async (req, res, next) => {
  try {
    const { note } = req.body;

    if (!note || note < 1 || note > 5 || !Number.isInteger(note)) {
      return res.status(400).json({ success: false, message: 'La note doit etre un entier entre 1 et 5' });
    }

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      client: req.user._id,
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation non trouvee' });
    }

    if (!reservation.retourSignale && reservation.statut !== 'terminee') {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez noter qu\'apres avoir signale le retour' });
    }

    if (reservation.note) {
      return res.status(400).json({ success: false, message: 'Vous avez deja soumis une note' });
    }

    reservation.note = note;
    await reservation.save();

    res.json({ success: true, message: 'Merci pour votre temoignage!' });
  } catch (error) {
    next(error);
  }
};
