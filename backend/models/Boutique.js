const mongoose = require('mongoose');

const boutiqueSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la boutique est requis'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
    },
    logo: {
      url: String,
      public_id: String,
    },
    adresse: {
      type: String,
      trim: true,
    },
    vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    statut: {
      type: String,
      enum: ['en_attente', 'validee', 'suspendue'],
      default: 'en_attente',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Boutique', boutiqueSchema);
