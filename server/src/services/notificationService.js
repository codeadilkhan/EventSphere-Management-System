const Notification = require('../models/Notification');

let socketIoInstance = null;

const setSocketIoInstance = (io) => {
  socketIoInstance = io;
};

const getSocketIoInstance = () => socketIoInstance;

/**
 * Dispatch an in-app notification and emit live socket event
 * @param {string|ObjectId} userId
 * @param {object} payload - { type, title, message, link }
 */
const notify = async (userId, { type = 'system', title, message, link = '' }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title: title.trim(),
      message: message.trim(),
      link: link || '',
      read: false,
    });

    if (socketIoInstance) {
      socketIoInstance.to(`user:${userId}`).emit('notification:new', {
        notification,
      });
      console.log(`[Notification Dispatched] To user:${userId} | "${title}"`);
    }

    return notification;
  } catch (err) {
    console.error('[NotificationService Error]', err.message);
    return null;
  }
};

module.exports = {
  setSocketIoInstance,
  getSocketIoInstance,
  notify,
};
