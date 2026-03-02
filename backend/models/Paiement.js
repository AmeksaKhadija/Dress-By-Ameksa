const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    montant: {
      type: Number,
      required: true,
      min: 0,
    },
    devise: {
      type: String,
      default: 'mad',
    },
    stripeSessionId: {
      type: String,
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
    },
    statut: {
      type: String,
      enum: ['en_attente', 'reussi', 'echoue', 'rembourse'],
      default: 'en_attente',
    },
    methode: {
      type: String,
      default: 'carte',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Paiement', paiementSchema);
