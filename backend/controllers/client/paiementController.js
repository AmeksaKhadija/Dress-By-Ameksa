const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Paiement = require('../../models/Paiement');
const Reservation = require('../../models/Reservation');
const User = require('../../models/User');
const sendEmail = require('../../utils/email');
const { paiementConfirmationTemplate } = require('../../utils/emailTemplates');

// @desc    Create Stripe checkout session
// @route   POST /api/client/paiement/checkout/:reservationId
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.reservationId,
      client: req.user._id,
      statut: 'en_attente',
    }).populate('tenue', 'nom images prix');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation non trouvee ou deja payee',
      });
    }

    // Check if a pending payment already exists
    const existingPaiement = await Paiement.findOne({
      reservation: reservation._id,
      statut: 'en_attente',
    });
    if (existingPaiement) {
      // Try to retrieve existing session
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(existingPaiement.stripeSessionId);
        if (existingSession.status === 'open') {
          return res.json({ success: true, url: existingSession.url });
        }
      } catch (e) {
        // Session expired, create new one
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'mad',
            product_data: {
              name: reservation.tenue.nom,
              images: reservation.tenue.images?.length > 0
                ? [reservation.tenue.images[0].url]
                : [],
            },
            unit_amount: Math.round(reservation.prixTotal * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        reservationId: reservation._id.toString(),
        clientId: req.user._id.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/client/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/client/reservations`,
    });

    await Paiement.create({
      reservation: reservation._id,
      client: req.user._id,
      montant: reservation.prixTotal,
      stripeSessionId: session.id,
      statut: 'en_attente',
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment after Stripe redirect
// @route   GET /api/client/paiement/verify/:sessionId
exports.verifyPayment = async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const paiement = await Paiement.findOne({ stripeSessionId: req.params.sessionId });

    if (!paiement) {
      return res.status(404).json({ success: false, message: 'Paiement non trouve' });
    }

    if (paiement.statut === 'reussi') {
      const reservation = await Reservation.findById(paiement.reservation)
        .populate('tenue', 'nom images prix type');
      return res.json({ success: true, paiement, reservation });
    }

    if (session.payment_status === 'paid') {
      paiement.statut = 'reussi';
      paiement.stripePaymentIntentId = session.payment_intent;
      await paiement.save();

      const reservation = await Reservation.findById(paiement.reservation);
      if (reservation && reservation.statut === 'en_attente') {
        reservation.statut = 'confirmee';
        await reservation.save();
      }

      // Send payment confirmation email
      const client = await User.findById(paiement.client);
      if (client?.email) {
        const html = paiementConfirmationTemplate({
          clientNom: client.nom,
          montant: paiement.montant,
          reservationId: paiement.reservation.toString(),
          datePaiement: new Date(),
        });
        sendEmail({
          to: client.email,
          subject: 'Confirmation de paiement - Dress by Ameksa',
          html,
        });
      }

      const populatedReservation = await Reservation.findById(paiement.reservation)
        .populate('tenue', 'nom images prix type');

      return res.json({ success: true, paiement, reservation: populatedReservation });
    }

    res.json({ success: false, message: 'Paiement non confirme', statut: session.payment_status });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/webhook/stripe
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const paiement = await Paiement.findOne({ stripeSessionId: session.id });

    if (paiement && paiement.statut !== 'reussi') {
      paiement.statut = 'reussi';
      paiement.stripePaymentIntentId = session.payment_intent;
      await paiement.save();

      const reservation = await Reservation.findById(paiement.reservation);
      if (reservation && reservation.statut === 'en_attente') {
        reservation.statut = 'confirmee';
        await reservation.save();
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const paiement = await Paiement.findOne({ stripeSessionId: session.id });
    if (paiement && paiement.statut === 'en_attente') {
      paiement.statut = 'echoue';
      await paiement.save();
    }
  }

  res.json({ received: true });
};
