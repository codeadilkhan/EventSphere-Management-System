const mongoose = require('mongoose');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');
const Session = require('../src/models/Session');
const Booth = require('../src/models/Booth');
const Feedback = require('../src/models/Feedback');
const Notification = require('../src/models/Notification');
const ExhibitorApplication = require('../src/models/ExhibitorApplication');
const ExhibitorProfile = require('../src/models/ExhibitorProfile');
const Message = require('../src/models/Message');
const userController = require('../src/controllers/userController');
const validate = require('../src/middleware/validate');
const { updateProfileValidator, deleteAccountValidator } = require('../src/utils/validators');

// Mock Mongoose models
jest.mock('../src/models/User');
jest.mock('../src/models/Registration');
jest.mock('../src/models/Session');
jest.mock('../src/models/Booth');
jest.mock('../src/models/Feedback');
jest.mock('../src/models/Notification');
jest.mock('../src/models/ExhibitorApplication');
jest.mock('../src/models/ExhibitorProfile');
jest.mock('../src/models/Message');
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  morganStream: { write: jest.fn() },
}));

describe('Task 09: Non-Functional Hardening & GDPR Privacy Tests', () => {
  const userId = new mongoose.Types.ObjectId();

  afterEach(() => {
    jest.clearAllMocks();
  });

  // T09.7: Consent & Profile Retrieval
  describe('T09.7: GDPR Consent & User Profile', () => {
    it('should retrieve user profile with consent timestamp', async () => {
      const mockUser = {
        _id: userId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'attendee',
        consentGiven: true,
        consentTimestamp: new Date('2026-11-17T10:00:00Z'),
        createdAt: new Date('2026-11-17T10:00:00Z'),
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const req = { user: { id: userId } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.getProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { user: mockUser },
        })
      );
    });
  });

  // T09.8: Data Portability (Download My Data)
  describe('T09.8: GDPR Article 20 Data Portability Export', () => {
    it('should aggregate and export complete personal archive in JSON format', async () => {
      const mockUser = {
        _id: userId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'attendee',
        consentGiven: true,
        createdAt: new Date(),
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      Registration.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              {
                _id: new mongoose.Types.ObjectId(),
                type: 'session',
                bookmarked: true,
                expoId: { _id: new mongoose.Types.ObjectId(), title: 'AI Expo' },
                sessionId: { _id: new mongoose.Types.ObjectId(), title: 'Keynote 1' },
              },
            ]),
          }),
        }),
      });

      ExhibitorProfile.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      ExhibitorApplication.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });

      Booth.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });

      Feedback.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });

      Notification.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      Message.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      const req = { user: { id: userId }, query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn() };
      const next = jest.fn();

      await userController.exportUserData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data.export;
      expect(data).toHaveProperty('userAccount');
      expect(data.userAccount.name).toBe('Jane Doe');
      expect(data).toHaveProperty('eventRegistrations');
      expect(data.eventRegistrations.length).toBe(1);
      expect(data.exportMetadata.compliance).toContain('GDPR');
    });
  });

  // T09.8: Right to Erasure (Delete Account)
  describe('T09.8: GDPR Article 17 Right to Erasure', () => {
    it('should reject account deletion when confirmation password is wrong', async () => {
      const mockUser = {
        _id: userId,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const req = {
        user: { id: userId },
        body: { password: 'wrongPassword123' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.deleteAccount(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
      expect(err.message).toContain('Incorrect password');
    });

    it('should purge all user data, release allocated stalls, decrement sessions, and delete user record on valid password', async () => {
      const mockUser = {
        _id: userId,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const sessionId1 = new mongoose.Types.ObjectId();
      Registration.find.mockResolvedValue([
        { sessionId: sessionId1, type: 'session' },
      ]);
      Session.findByIdAndUpdate.mockResolvedValue({});
      Booth.updateMany.mockResolvedValue({});
      Registration.deleteMany.mockResolvedValue({});
      Feedback.deleteMany.mockResolvedValue({});
      Notification.deleteMany.mockResolvedValue({});
      ExhibitorProfile.deleteOne.mockResolvedValue({});
      ExhibitorApplication.deleteMany.mockResolvedValue({});
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      const req = {
        user: { id: userId },
        body: { password: 'validPassword123' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await userController.deleteAccount(req, res, next);

      expect(Booth.updateMany).toHaveBeenCalledWith(
        { exhibitorId: userId },
        expect.objectContaining({ status: 'available', exhibitorId: null })
      );
      expect(Session.findByIdAndUpdate).toHaveBeenCalledWith(
        sessionId1,
        { $inc: { registeredCount: -1 } }
      );
      expect(Registration.deleteMany).toHaveBeenCalledWith({ attendeeId: userId });
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('permanently removed in compliance with GDPR guidelines'),
        })
      );
    });
  });

  // T09.2: Central Request Validation Middleware
  describe('T09.2: Joi Validation Middleware', () => {
    it('should reject invalid payload with detailed 400 error', () => {
      const middleware = validate(deleteAccountValidator);
      const req = { body: {} }; // missing password
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('Password confirmation is required');
    });

    it('should strip unknown fields and pass valid payload', () => {
      const middleware = validate(updateProfileValidator);
      const req = { body: { name: 'Alice New Name', maliciousField: '<script>alert(1)</script>' } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body.name).toBe('Alice New Name');
      expect(req.body).not.toHaveProperty('maliciousField');
    });
  });
});
