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
    taille: {
      type: String,
      required: [true, 'La taille est requise'],
    },
    couleur: {
      type: String,
      required: [true, 'La couleur est requise'],
    },
    prixTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    litige: {
      type: Boolean,
      default: false,
    },
    commentaireLitige: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
