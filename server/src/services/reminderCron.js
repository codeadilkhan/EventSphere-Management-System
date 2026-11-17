const cron = require('node-cron');
const Registration = require('../models/Registration');
const Session = require('../models/Session');
const { notify } = require('./notificationService');
const { sendSessionReminderEmail } = require('./emailService');

/**
 * Scan for upcoming sessions (starting in next 45 minutes) and notify attendees
 */
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const reminderWindow = new Date(now.getTime() + 45 * 60 * 1000); // 45 minutes ahead

    // Find sessions starting between now and 45 mins from now that are scheduled or ongoing
    const upcomingSessions = await Session.find({
      status: { $in: ['scheduled', 'ongoing'] },
      startTime: { $gte: now, $lte: reminderWindow },
    }).populate('expoId', 'title venue city');

    if (!upcomingSessions || upcomingSessions.length === 0) {
      return 0;
    }

    const sessionIds = upcomingSessions.map((s) => s._id);

    // Find registrations for these sessions where reminder has not been sent yet
    const pendingRegistrations = await Registration.find({
      sessionId: { $in: sessionIds },
      reminderSent: false,
    }).populate('attendeeId', 'name email').populate('sessionId');

    let remindersDispatched = 0;

    for (const reg of pendingRegistrations) {
      const attendee = reg.attendeeId;
      const session = reg.sessionId;

      if (!attendee || !session) continue;

      // Atomically mark reminderSent as true FIRST to guarantee exactly-once delivery
      const updated = await Registration.findOneAndUpdate(
        { _id: reg._id, reminderSent: false },
        { reminderSent: true }
      );

      if (!updated) {
        // Already updated by another concurrent worker
        continue;
      }

      const expoTitle = session.expoId?.title || 'Trade Expo';
      const formattedTime = new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 1. Dispatch in-app notification
      await notify(attendee._id, {
        type: 'reminder',
        title: `Reminder: "${session.title}" Starts Soon`,
        message: `Your reserved keynote session begins at ${formattedTime} in ${session.hall}. Head to the hall to take your seat.`,
        link: '/events/my-schedule',
      });

      // 2. Dispatch reminder email
      if (attendee.email) {
        await sendSessionReminderEmail(
          attendee.email,
          attendee.name,
          session.title,
          session.hall,
          session.startTime,
          expoTitle
        );
      }

      remindersDispatched++;
    }

    if (remindersDispatched > 0) {
      console.log(`[Reminder Cron] Successfully dispatched ${remindersDispatched} keynote session reminders.`);
    }

    return remindersDispatched;
  } catch (err) {
    console.error('[Reminder Cron Error]', err.message);
    return 0;
  }
};

/**
 * Initialize background cron job (runs every 5 minutes)
 */
const startReminderCron = () => {
  // Run every 5 minutes: '*/5 * * * *'
  const task = cron.schedule('*/5 * * * *', async () => {
    console.log('[Reminder Cron] Checking for upcoming keynotes and workshops...');
    await checkAndSendReminders();
  });

  console.log('[Reminder Cron Service] Background session reminder scheduler active (every 5 min).');
  return task;
};

module.exports = {
  checkAndSendReminders,
  startReminderCron,
};
