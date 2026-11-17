const mongoose = require('mongoose');
const Notification = require('../src/models/Notification');
const Feedback = require('../src/models/Feedback');
const Registration = require('../src/models/Registration');
const Session = require('../src/models/Session');
const notificationController = require('../src/controllers/notificationController');
const feedbackController = require('../src/controllers/feedbackController');
const { checkAndSendReminders } = require('../src/services/reminderCron');
const { notify } = require('../src/services/notificationService');

// Mock Mongoose models
jest.mock('../src/models/Notification');
jest.mock('../src/models/Feedback');
jest.mock('../src/models/Registration');
jest.mock('../src/models/Session');
jest.mock('../src/models/User');
jest.mock('../src/services/emailService', () => ({
  sendSessionReminderEmail: jest.fn().mockResolvedValue(true),
  sendFeedbackReplyEmail: jest.fn().mockResolvedValue(true),
  sendApplicationStatusEmail: jest.fn().mockResolvedValue(true),
}));

describe('Task 07: Notifications, Reminders & Feedback Module Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('T07.1 & T07.4: In-App Notifications API', () => {
    const userId = new mongoose.Types.ObjectId();
    const notifId = new mongoose.Types.ObjectId();

    it('should list notifications with unread count and pagination metadata', async () => {
      const mockNotifications = [
        { _id: notifId, userId, title: 'Session Starting', read: false },
      ];

      Notification.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockNotifications),
            }),
          }),
        }),
      });

      Notification.countDocuments
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // unreadCount

      const req = {
        user: { id: userId },
        query: { page: '1', limit: '10' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await notificationController.getMyNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            notifications: mockNotifications,
            unreadCount: 1,
            pagination: expect.objectContaining({ total: 1, pages: 1 }),
          }),
        })
      );
    });

    it('should mark single notification as read', async () => {
      Notification.findOneAndUpdate.mockResolvedValue({
        _id: notifId,
        userId,
        read: true,
      });
      Notification.countDocuments.mockResolvedValue(0);

      const req = {
        user: { id: userId },
        params: { id: notifId },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await notificationController.markAsRead(req, res, next);

      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: notifId, userId },
        { read: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ unreadCount: 0 }),
        })
      );
    });

    it('should mark all notifications as read for current user', async () => {
      Notification.updateMany.mockResolvedValue({ modifiedCount: 4 });

      const req = { user: { id: userId } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await notificationController.markAllAsRead(req, res);

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { userId, read: false },
        { read: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { unreadCount: 0 },
        })
      );
    });
  });

  describe('T07.6 & T07.7: Automated Session Reminders Exactly Once', () => {
    it('should find upcoming keynotes in the 45-min window and send reminder exactly once', async () => {
      const sessionId = new mongoose.Types.ObjectId();
      const attendeeId = new mongoose.Types.ObjectId();
      const regId = new mongoose.Types.ObjectId();

      const mockSession = {
        _id: sessionId,
        title: 'Keynote on Quantum Edge Computing',
        hall: 'Auditorium A',
        startTime: new Date(Date.now() + 20 * 60 * 1000), // starts in 20 minutes
        status: 'scheduled',
        expoId: { title: 'Global Tech Expo 2026' },
      };

      Session.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockSession]),
      });

      const mockRegistration = {
        _id: regId,
        attendeeId: { _id: attendeeId, name: 'Alice Smith', email: 'alice@example.com' },
        sessionId: mockSession,
        reminderSent: false,
      };

      Registration.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([mockRegistration]),
        }),
      });

      // Atomically mark reminderSent = true to guarantee exactly-once
      Registration.findOneAndUpdate.mockResolvedValue({
        _id: regId,
        reminderSent: true,
      });

      Notification.create.mockResolvedValue({});

      const count = await checkAndSendReminders();

      expect(count).toBe(1);
      expect(Registration.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: regId, reminderSent: false },
        { reminderSent: true }
      );
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: attendeeId,
          type: 'reminder',
          title: expect.stringContaining('Reminder: "Keynote on Quantum Edge Computing"'),
        })
      );
    });

    it('should skip sending reminder if registration was already marked reminderSent', async () => {
      Session.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const count = await checkAndSendReminders();
      expect(count).toBe(0);
      expect(Notification.create).not.toHaveBeenCalled();
    });
  });

  describe('T07.9 - T07.11: Feedback, Inquiries & Support Flow', () => {
    const userId = new mongoose.Types.ObjectId();
    const ticketId = new mongoose.Types.ObjectId();
    const adminId = new mongoose.Types.ObjectId();

    it('should allow user to submit a support ticket with validation', async () => {
      const createdTicket = {
        _id: ticketId,
        userId,
        type: 'issue',
        subject: 'WiFi Connectivity at Hall B',
        message: 'The guest SSID is dropping packets during the morning keynote.',
        status: 'open',
      };

      Feedback.create.mockResolvedValue(createdTicket);

      const req = {
        user: { id: userId },
        body: {
          type: 'issue',
          subject: 'WiFi Connectivity at Hall B',
          message: 'The guest SSID is dropping packets during the morning keynote.',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await feedbackController.submitFeedback(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { feedback: createdTicket },
        })
      );
    });

    it('should reject ticket submission when subject or message is missing', async () => {
      const req = {
        user: { id: userId },
        body: { type: 'inquiry', subject: '', message: '' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await feedbackController.submitFeedback(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Subject line is required.');
    });

    it('should allow admin to reply to feedback ticket and notify the author', async () => {
      const mockTicket = {
        _id: ticketId,
        userId: { _id: userId, name: 'Alice Smith', email: 'alice@example.com' },
        subject: 'WiFi Connectivity at Hall B',
        message: 'Network issue',
        status: 'open',
        save: jest.fn().mockResolvedValue(true),
      };

      Feedback.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(mockTicket),
      });
      Notification.create.mockResolvedValue({});

      const populatedTicket = {
        ...mockTicket,
        status: 'resolved',
        adminReply: 'Our network team deployed an additional access point to Hall B.',
        repliedBy: { _id: adminId, name: 'Admin Team' },
      };
      Feedback.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedTicket),
        }),
      });

      const req = {
        params: { id: ticketId },
        user: { id: adminId },
        body: {
          reply: 'Our network team deployed an additional access point to Hall B.',
          status: 'resolved',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await feedbackController.replyToFeedback(req, res, next);

      expect(mockTicket.save).toHaveBeenCalled();
      expect(mockTicket.status).toBe('resolved');
      expect(mockTicket.adminReply).toContain('Our network team deployed an additional access point');

      // In-app notification sent to the ticket author
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          type: 'system',
          title: 'Support Response Received',
        })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Reply delivered and ticket updated.',
        })
      );
    });
  });
});
