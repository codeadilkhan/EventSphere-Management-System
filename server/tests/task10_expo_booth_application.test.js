const mongoose = require('mongoose');
const Expo = require('../src/models/Expo');
const Booth = require('../src/models/Booth');
const ExhibitorApplication = require('../src/models/ExhibitorApplication');
const User = require('../src/models/User');
const expoController = require('../src/controllers/expoController');
const boothController = require('../src/controllers/boothController');
const applicationController = require('../src/controllers/applicationController');
const { authorize } = require('../src/middleware/authMiddleware');

// Mock Mongoose models
jest.mock('../src/models/Expo');
jest.mock('../src/models/Booth');
jest.mock('../src/models/ExhibitorApplication');
jest.mock('../src/models/User');
jest.mock('../src/models/Notification');
jest.mock('../src/services/notificationService', () => ({
  notify: jest.fn().mockResolvedValue(true),
  setSocketIoInstance: jest.fn(),
}));
jest.mock('../src/services/emailService', () => ({
  sendApplicationStatusEmail: jest.fn().mockResolvedValue(true),
}));

describe('Task 10: Expo, Booth & Exhibitor Application Tests (T10.4 & T10.5)', () => {
  const expoId = new mongoose.Types.ObjectId();
  const boothId = new mongoose.Types.ObjectId();
  const exhibitorId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();

  afterEach(() => {
    jest.clearAllMocks();
  });

  // T10.4: Expo Management CRUD Tests
  describe('T10.4: Expo Creation & Management', () => {
    it('should allow admin to create a new expo', async () => {
      const mockExpo = {
        _id: expoId,
        title: 'Global Renewable Energy Expo 2026',
        theme: 'Clean Energy',
        startDate: new Date('2026-11-20'),
        endDate: new Date('2026-11-22'),
        location: { venue: 'Hall 1', city: 'Berlin' },
        status: 'published',
        createdBy: adminId,
      };

      Expo.create.mockResolvedValue(mockExpo);

      const req = {
        user: { id: adminId, role: 'admin' },
        body: {
          title: 'Global Renewable Energy Expo 2026',
          theme: 'Clean Energy',
          startDate: '2026-11-20',
          endDate: '2026-11-22',
          location: { venue: 'Hall 1', city: 'Berlin' },
          status: 'published',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await expoController.createExpo(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      const data = res.json.mock.calls[0][0];
      expect(data.success).toBe(true);
      expect(data.data.expo.title).toBe('Global Renewable Energy Expo 2026');
    });
  });

  // T10.4: Booth Management & Duplicate Prevention
  describe('T10.4: Booth Creation & Floor Plan Allocation', () => {
    it('should reject booth creation if booth number already exists in expo', async () => {
      Booth.findOne.mockResolvedValue({ _id: boothId, boothNumber: 'A-01' });

      const req = {
        body: {
          expoId: expoId.toString(),
          boothNumber: 'A-01',
          price: 1000,
        },
        app: { get: jest.fn() },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await boothController.createBooth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('already exists in this exhibition');
    });

    it('should bulk generate booth matrix layout successfully', async () => {
      Expo.findById.mockResolvedValue({ _id: expoId, title: 'Clean Tech 2026' });
      Booth.findOne.mockResolvedValue(null); // No pre-existing booths
      Booth.create.mockResolvedValue({});
      Booth.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: new mongoose.Types.ObjectId(), boothNumber: 'A-01' },
          { _id: new mongoose.Types.ObjectId(), boothNumber: 'A-02' },
          { _id: new mongoose.Types.ObjectId(), boothNumber: 'B-01' },
          { _id: new mongoose.Types.ObjectId(), boothNumber: 'B-02' },
        ]),
      });

      const req = {
        body: {
          expoId: expoId.toString(),
          rows: 2,
          cols: 2,
          basePrice: 600,
        },
        app: { get: jest.fn() },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await boothController.bulkGenerateBooths(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      const data = res.json.mock.calls[0][0];
      expect(data.data.createdCount).toBe(4);
    });
  });

  // T10.5: Exhibitor Application Workflow & Duplicate Prevention
  describe('T10.5: Exhibitor Applications & Double-Booking Prevention', () => {
    it('should prevent duplicate applications by the same exhibitor for the same expo', async () => {
      Expo.findById.mockResolvedValue({ _id: expoId, title: 'Clean Tech 2026' });
      ExhibitorApplication.findOne.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        status: 'pending',
      });

      const req = {
        user: { id: exhibitorId },
        body: { expoId: expoId.toString() },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await applicationController.submitApplication(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('already submitted an application');
    });

    it('should allow admin to review and approve an exhibitor application', async () => {
      const mockApp = {
        _id: new mongoose.Types.ObjectId(),
        exhibitorId: { _id: exhibitorId, name: 'EcoCorp', email: 'eco@example.com' },
        expoId: { _id: expoId, title: 'Clean Tech 2026' },
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      ExhibitorApplication.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApp),
      });

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ name: 'EcoCorp', email: 'eco@example.com' }),
      });

      const req = {
        params: { id: mockApp._id.toString() },
        user: { id: adminId },
        body: { status: 'approved', reviewNotes: 'Documents verified and approved.' },
        app: { get: jest.fn() },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await applicationController.reviewApplication(req, res, next);

      expect(mockApp.save).toHaveBeenCalled();
      expect(mockApp.status).toBe('approved');
      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0];
      expect(data.success).toBe(true);
      expect(data.message).toContain('approved');
    });
  });

  // T10.11: Broken Access Control Security Tests
  describe('T10.11: Broken Access Control & RBAC Enforcement', () => {
    it('should reject non-admin users attempting to access admin operations with 403', () => {
      const adminMiddleware = authorize('admin');
      const req = { user: { id: new mongoose.Types.ObjectId(), role: 'attendee' } };
      const res = {};
      const next = jest.fn();

      adminMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toContain('Access restricted');
    });

    it('should permit exhibitor to access exhibitor operations', () => {
      const exhibitorMiddleware = authorize('exhibitor');
      const req = { user: { id: new mongoose.Types.ObjectId(), role: 'exhibitor' } };
      const res = {};
      const next = jest.fn();

      exhibitorMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith(); // No error passed
    });
  });
});
