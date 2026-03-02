const Boutique = require('../../models/Boutique');

// @desc    Get all boutiques (admin)
// @route   GET /api/admin/boutiques
exports.getAllBoutiques = async (req, res, next) => {
  try {
    const { statut } = req.query;
    const query = statut ? { statut } : {};

    const boutiques = await Boutique.find(query)
      .populate('vendeur', 'nom email telephone')
      .sort({ createdAt: -1 });

    res.json({ success: true, boutiques });
  } catch (error) {
    next(error);
  }
};

// @desc    Update boutique status (admin validation)
// @route   PUT /api/admin/boutiques/:id/statut
exports.updateBoutiqueStatut = async (req, res, next) => {
  try {
    const { statut } = req.body;

    if (!['validee', 'suspendue', 'en_attente'].includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    ).populate('vendeur', 'nom email');

    if (!boutique) {
      return res.status(404).json({ success: false, message: 'Boutique non trouvee' });
    }

    res.json({
      success: true,
      message: `Boutique ${statut === 'validee' ? 'validee' : statut === 'suspendue' ? 'suspendue' : 'mise en attente'}`,
      boutique,
    });
  } catch (error) {
    next(error);
  }
};
