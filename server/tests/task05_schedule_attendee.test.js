const mongoose = require('mongoose');
const Session = require('../src/models/Session');
const Registration = require('../src/models/Registration');
const Expo = require('../src/models/Expo');
const ExhibitorProfile = require('../src/models/ExhibitorProfile');
const sessionController = require('../src/controllers/sessionController');
const registrationController = require('../src/controllers/registrationController');
const exhibitorController = require('../src/controllers/exhibitorController');

// Mock Mongoose models for unit testing controllers & business logic
jest.mock('../src/models/Session');
jest.mock('../src/models/Registration');
jest.mock('../src/models/Expo');
jest.mock('../src/models/ExhibitorProfile');
jest.mock('../src/models/Notification');
jest.mock('../src/models/Booth');

describe('Task 05: Schedule Management & Attendee Module Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('T05.2 & T05.3: Session Scheduling, Validation & Hall Conflict', () => {
    const mockExpo = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Global Tech Expo 2026',
      startDate: new Date('2026-11-20T00:00:00.000Z'),
      endDate: new Date('2026-11-22T23:59:59.999Z'),
    };

    it('should reject session creation when endTime is before or equal to startTime', async () => {
      Expo.findById.mockResolvedValue(mockExpo);

      const req = {
        body: {
          expoId: mockExpo._id,
          title: 'Invalid Timing Session',
          description: 'A test session',
          speaker: { name: 'Dr. Jane' },
          topic: 'AI',
          hall: 'Hall A',
          startTime: '2026-11-20T14:00:00.000Z',
          endTime: '2026-11-20T13:00:00.000Z', // earlier than start
          capacity: 100,
        },
        app: { get: jest.fn() },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await sessionController.createSession(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('Session end time must be after start time');
    });

    it('should reject session creation when dates fall outside the exhibition date range', async () => {
      Expo.findById.mockResolvedValue(mockExpo);

      const req = {
        body: {
          expoId: mockExpo._id,
          title: 'Out of range Session',
          description: 'A test session',
          speaker: { name: 'Dr. Jane' },
          topic: 'AI',
          hall: 'Hall A',
          startTime: '2026-11-25T10:00:00.000Z', // after expo.endDate
          endTime: '2026-11-25T11:00:00.000Z',
          capacity: 100,
        },
        app: { get: jest.fn() },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await sessionController.createSession(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('Session timing must fall within the exhibition date range');
    });

    it('should reject session creation if the hall is already occupied during the requested timeslot', async () => {
      Expo.findById.mockResolvedValue(mockExpo);

      // Simulate existing conflicting session in Hall A
      Session.findOne.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        title: 'Existing Keynote',
        hall: 'Hall A',
        startTime: new Date('2026-11-20T10:00:00.000Z'),
        endTime: new Date('2026-11-20T12:00:00.000Z'),
      });

      const req = {
        body: {
          expoId: mockExpo._id,
          title: 'Overlapping Session',
          description: 'Conflict attempt',
          speaker: { name: 'John Doe' },
          topic: 'Robotics',
          hall: 'Hall A',
          startTime: '2026-11-20T11:00:00.000Z', // overlaps 11:00 - 13:00
          endTime: '2026-11-20T13:00:00.000Z',
          capacity: 80,
        },
        app: { get: jest.fn() },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await sessionController.createSession(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toMatch(/Schedule Conflict: "Hall A" is already occupied/);
    });

    it('should successfully create session when timing and hall have no conflict', async () => {
      Expo.findById.mockResolvedValue(mockExpo);
      Session.findOne.mockResolvedValue(null); // No conflict

      const createdSession = {
        _id: new mongoose.Types.ObjectId(),
        expoId: mockExpo._id,
        title: 'Keynote on Quantum AI',
        hall: 'Main Auditorium',
        startTime: new Date('2026-11-20T10:00:00.000Z'),
        endTime: new Date('2026-11-20T11:30:00.000Z'),
        capacity: 150,
      };
      Session.create.mockResolvedValue(createdSession);

      const req = {
        body: {
          expoId: mockExpo._id,
          title: 'Keynote on Quantum AI',
          description: 'Deep dive into quantum algorithms',
          speaker: { name: 'Dr. Robert Oppen' },
          topic: 'Quantum Computing',
          hall: 'Main Auditorium',
          startTime: '2026-11-20T10:00:00.000Z',
          endTime: '2026-11-20T11:30:00.000Z',
          capacity: 150,
        },
        app: { get: jest.fn().mockReturnValue(null) },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await sessionController.createSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { session: createdSession },
        })
      );
    });
  });

  describe('T05.6: Attendee Registration & Capacity Checks', () => {
    const attendeeId = new mongoose.Types.ObjectId();
    const sessionId = new mongoose.Types.ObjectId();
    const expoId = new mongoose.Types.ObjectId();

    it('should prevent an attendee from registering twice for the same session', async () => {
      const mockSession = {
        _id: sessionId,
        title: 'Advanced AI Architectures',
        hall: 'Hall A',
        capacity: 100,
        registeredCount: 20,
        expoId: { _id: expoId, title: 'AI Summit' },
      };

      Session.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSession),
      });

      // Existing registration found
      Registration.findOne.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        attendeeId,
        sessionId,
        type: 'session',
      });

      const req = {
        user: { id: attendeeId },
        body: { sessionId },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await registrationController.registerForSession(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('You are already registered for this session.');
      expect(Session.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should reject registration when hall capacity has been reached', async () => {
      const mockSession = {
        _id: sessionId,
        title: 'Full Capacity Workshop',
        hall: 'Lab 1',
        capacity: 50,
        registeredCount: 50, // max capacity reached
        expoId: { _id: expoId, title: 'AI Summit' },
      };

      Session.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSession),
      });

      Registration.findOne.mockResolvedValue(null); // Not registered yet

      const req = {
        user: { id: attendeeId },
        body: { sessionId },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await registrationController.registerForSession(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('has reached its maximum hall capacity of 50 seats');
      expect(Session.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should atomically reserve seat and record registration when seats are available', async () => {
      const mockSession = {
        _id: sessionId,
        title: 'Open Workshop',
        hall: 'Lab 1',
        capacity: 50,
        registeredCount: 42,
        expoId: { _id: expoId, title: 'AI Summit' },
      };

      Session.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSession),
      });
      Registration.findOne.mockResolvedValue(null);
      Session.findByIdAndUpdate.mockResolvedValue({});
      Registration.create.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        attendeeId,
        sessionId,
        expoId,
        type: 'session',
        registeredAt: new Date(),
      });

      const req = {
        user: { id: attendeeId },
        body: { sessionId },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await registrationController.registerForSession(req, res, next);

      expect(Session.findByIdAndUpdate).toHaveBeenCalledWith(sessionId, {
        $inc: { registeredCount: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('Seat confirmed'),
        })
      );
    });

    it('should decrement registeredCount and remove registration on cancelRegistration', async () => {
      const mockReg = {
        _id: new mongoose.Types.ObjectId(),
        attendeeId,
        sessionId,
        type: 'session',
      };

      Registration.findOne.mockResolvedValue(mockReg);
      Registration.findByIdAndDelete.mockResolvedValue(mockReg);
      Session.findByIdAndUpdate.mockResolvedValue({});

      const req = {
        user: { id: attendeeId },
        params: { sessionId },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await registrationController.cancelRegistration(req, res, next);

      expect(Registration.findByIdAndDelete).toHaveBeenCalledWith(mockReg._id);
      expect(Session.findByIdAndUpdate).toHaveBeenCalledWith(sessionId, {
        $inc: { registeredCount: -1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('registration has been cancelled and seat released'),
        })
      );
    });
  });

  describe('T05.8: Exhibitor Directory Case-Insensitive Search & Filters', () => {
    it('should construct case-insensitive regex query across companyName, description, and products', async () => {
      const mockExhibitors = [
        {
          companyName: 'TechNova Solutions',
          category: 'Artificial Intelligence',
          products: [{ name: 'NovaCore AI Engine' }],
        },
      ];

      ExhibitorProfile.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockExhibitors),
        }),
      });

      const req = {
        query: {
          q: 'novacore',
          category: 'Artificial Intelligence',
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await exhibitorController.searchExhibitors(req, res);

      expect(ExhibitorProfile.find).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Artificial Intelligence',
          $or: [
            { companyName: { $regex: 'novacore', $options: 'i' } },
            { description: { $regex: 'novacore', $options: 'i' } },
            { 'products.name': { $regex: 'novacore', $options: 'i' } },
          ],
        })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { count: 1, exhibitors: mockExhibitors },
        })
      );
    });
  });
});
