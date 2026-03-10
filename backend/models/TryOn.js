const mongoose = require('mongoose');

const tryOnSchema = new mongoose.Schema(
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
    taille: {
      type: Number,
      required: [true, 'La taille en cm est requise'],
      min: [100, 'La taille minimum est 100 cm'],
      max: [220, 'La taille maximum est 220 cm'],
    },
    poids: {
      type: Number,
      required: [true, 'Le poids en kg est requis'],
      min: [30, 'Le poids minimum est 30 kg'],
      max: [200, 'Le poids maximum est 200 kg'],
    },
    couleurPeau: {
      type: String,
      required: [true, 'La couleur de peau est requise'],
      enum: ['tres_claire', 'claire', 'moyenne', 'mate', 'foncee', 'tres_foncee'],
    },
    morphologie: {
      type: String,
      required: [true, 'La morphologie est requise'],
      enum: ['sablier', 'triangle', 'triangle_inverse', 'rectangle', 'ronde'],
    },
    imageGeneree: {
      url: { type: String, required: true },
      public_id: { type: String, default: '' },
    },
    promptUtilise: {
      type: String,
    },
    statut: {
      type: String,
      enum: ['en_cours', 'terminee', 'erreur'],
      default: 'terminee',
    },
  },
  { timestamps: true }
);

tryOnSchema.index({ client: 1, createdAt: -1 });

module.exports = mongoose.model('TryOn', tryOnSchema);
