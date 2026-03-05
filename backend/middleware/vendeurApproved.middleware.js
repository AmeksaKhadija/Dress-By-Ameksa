const vendeurApproved = (req, res, next) => {
  if (req.user.role === 'vendeur' && req.user.statut !== 'actif') {
    return res.status(403).json({
      success: false,
      message: 'Votre compte vendeur est en attente d\'approbation par l\'administrateur',
    });
  }
  next();
};

module.exports = vendeurApproved;
