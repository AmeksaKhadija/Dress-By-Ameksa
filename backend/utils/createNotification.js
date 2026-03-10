const Notification = require('../models/Notification');

const createNotification = async ({ utilisateur, type, titre, message, lien, reservation }) => {
  try {
    await Notification.create({ utilisateur, type, titre, message, lien, reservation });
  } catch (error) {
    console.error('Erreur creation notification:', error.message);
  }
};

module.exports = createNotification;
