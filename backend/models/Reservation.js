const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenue',
      required: true,
    },
    dateDebut: {
      type: Date,
      required: [true, 'La date de debut est requise'],
    },
    dateFin: {
      type: Date,
      required: [true, 'La date de fin est requise'],
    },
    statut: {
      type: String,
      enum: ['en_attente', 'confirmee', 'annulee', 'terminee'],
      default: 'en_attente',
    },
    prixTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
