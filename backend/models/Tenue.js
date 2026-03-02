const mongoose = require('mongoose');

const tenueSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la tenue est requis'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Le type est requis'],
      enum: ['caftan', 'takchita', 'robe de soiree'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: 0,
    },
    tailles: [{
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    }],
    couleurs: [String],
    images: [{
      url: String,
      public_id: String,
    }],
    boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boutique',
      required: true,
    },
    disponible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

tenueSchema.index({ nom: 'text', description: 'text' });

module.exports = mongoose.model('Tenue', tenueSchema);
