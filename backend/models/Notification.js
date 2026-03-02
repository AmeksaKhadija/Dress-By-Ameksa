const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'reservation_confirmee',
        'reservation_annulee',
        'reservation_terminee',
        'paiement_reussi',
        'paiement_echoue',
        'nouvelle_reservation',
      ],
      required: true,
    },
    titre: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    lue: {
      type: Boolean,
      default: false,
    },
    lien: {
      type: String,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ utilisateur: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
