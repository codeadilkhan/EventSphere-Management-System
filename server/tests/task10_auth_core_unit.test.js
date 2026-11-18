const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { signAuthToken, verifyAuthToken } = require('../src/utils/tokenManager');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  boothValidator,
  sessionValidator,
} = require('../src/utils/validators');
const authController = require('../src/controllers/authController');
const User = require('../src/models/User');

// Mock User model & email service
jest.mock('../src/models/User');
jest.mock('../src/services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

describe('Task 10: Auth Core & Unit Tests (T10.2 & T10.3)', () => {
  const userId = new mongoose.Types.ObjectId();
  const validSecret = 'test_secret_key_eventsphere_2026';

  beforeAll(() => {
    process.env.JWT_SECRET = validSecret;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // T10.2: Token Manager Unit Tests
  describe('JWT Token Helper Unit Tests', () => {
    it('should generate a verifiable JWT token with correct payload', () => {
      const token = signAuthToken(userId.toString(), 'exhibitor');
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const decoded = verifyAuthToken(token);
      expect(decoded.id).toBe(userId.toString());
      expect(decoded.role).toBe('exhibitor');
    });

    it('should throw an error when verifying an invalid or tampered token', () => {
      const invalidToken = 'ey12345.tamperedPayload.sig67890';
      expect(() => verifyAuthToken(invalidToken)).toThrow();
    });
  });

  // T10.2: Joi Validator Unit Tests
  describe('Joi Request Validator Unit Tests', () => {
    it('should accept valid registration payload', () => {
      const payload = {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'securePassword123',
        role: 'attendee',
        consentGiven: true,
      };
      const { error, value } = registerValidator.validate(payload);
      expect(error).toBeUndefined();
      expect(value.email).toBe('sarah@example.com');
    });

    it('should reject registration when consentGiven is false or missing', () => {
      const payload = {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'securePassword123',
        consentGiven: false,
      };
      const { error } = registerValidator.validate(payload);
      expect(error).toBeDefined();
      expect(error.message).toContain('Terms');
    });

    it('should reject registration with invalid email format or password < 6 characters', () => {
      const payload = {
        name: 'Sarah Connor',
        email: 'invalid-email-address',
        password: '123',
        consentGiven: true,
      };
      const { error } = registerValidator.validate(payload);
      expect(error).toBeDefined();
    });

    it('should validate session timing constraint (endTime >= startTime)', () => {
      const validSession = {
        expoId: new mongoose.Types.ObjectId().toString(),
        title: 'Future of Cloud Infrastructure',
        description: 'Comprehensive keynote on scalable microservices',
        speaker: { name: 'Dr. John Doe', company: 'Cloud Corp' },
        topic: 'Cloud Computing',
        hall: 'Main Auditorium A',
        startTime: new Date('2026-11-20T10:00:00Z').toISOString(),
        endTime: new Date('2026-11-20T11:30:00Z').toISOString(),
        capacity: 150,
      };
      const { error } = sessionValidator.validate(validSession);
      expect(error).toBeUndefined();

      const invalidSession = {
        ...validSession,
        startTime: new Date('2026-11-20T14:00:00Z').toISOString(),
        endTime: new Date('2026-11-20T12:00:00Z').toISOString(), // end before start
      };
      const { error: timeError } = sessionValidator.validate(invalidSession);
      expect(timeError).toBeDefined();
    });
  });

  // T10.3: Auth Integration Controller Tests
  describe('Auth Integration Controller Tests', () => {
    it('should register a new user successfully and return user object without password', async () => {
      User.findOne.mockResolvedValue(null); // No existing email
      const mockCreated = {
        _id: userId,
        name: 'David Miller',
        email: 'david@example.com',
        role: 'attendee',
        phone: '123-456-7890',
        consentGiven: true,
        consentTimestamp: new Date(),
        createdAt: new Date(),
      };
      User.create.mockResolvedValue(mockCreated);

      const req = {
        body: {
          name: 'David Miller',
          email: 'david@example.com',
          password: 'password123',
          role: 'attendee',
          phone: '123-456-7890',
          consentGiven: true,
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      const resData = res.json.mock.calls[0][0];
      expect(resData.success).toBe(true);
      expect(resData.data.user.email).toBe('david@example.com');
      expect(resData.data.token).toBeDefined();
      expect(resData.data.user).not.toHaveProperty('password');
    });

    it('should reject registration with 400 when email already exists', async () => {
      User.findOne.mockResolvedValue({ _id: new mongoose.Types.ObjectId(), email: 'existing@example.com' });

      const req = {
        body: {
          name: 'David Miller',
          email: 'existing@example.com',
          password: 'password123',
          role: 'attendee',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('already exists');
    });

    it('should authenticate user with valid credentials and return JWT token', async () => {
      const mockUser = {
        _id: userId,
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        role: 'exhibitor',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const req = {
        body: { email: 'sarah@example.com', password: 'correctPassword123' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const resData = res.json.mock.calls[0][0];
      expect(resData.success).toBe(true);
      expect(resData.data.token).toBeDefined();
      expect(resData.data.user.role).toBe('exhibitor');
    });

    it('should reject login with 401 when password is invalid', async () => {
      const mockUser = {
        _id: userId,
        email: 'sarah@example.com',
        comparePassword: jest.fn().mockResolvedValue(false), // Invalid password
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const req = {
        body: { email: 'sarah@example.com', password: 'wrongPassword' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
      expect(err.message).toContain('Invalid email or password');
    });

    it('should reject login with 401 when user does not exist', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = {
        body: { email: 'notfound@example.com', password: 'password123' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
    });
  });
});
