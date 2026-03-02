const Notification = require('../../models/Notification');
const paginate = require('../../utils/pagination');

// @desc    Get client notifications
// @route   GET /api/client/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { results, pagination } = await paginate(
      Notification,
      { utilisateur: req.user._id },
      {
        page: req.query.page,
        limit: req.query.limit || 20,
        sort: { createdAt: -1 },
      }
    );

    res.json({ success: true, notifications: results, pagination });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/client/notifications/unread-count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      utilisateur: req.user._id,
      lue: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark one notification as read
// @route   PUT /api/client/notifications/:id/lire
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, utilisateur: req.user._id },
      { lue: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvee' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/client/notifications/lire-tout
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { utilisateur: req.user._id, lue: false },
      { lue: true }
    );
    res.json({ success: true, message: 'Toutes les notifications marquees comme lues' });
  } catch (error) {
    next(error);
  }
};
