const mongoose = require('mongoose');
const Message = require('../src/models/Message');
const User = require('../src/models/User');
const messageController = require('../src/controllers/messageController');

// Mock models
jest.mock('../src/models/Message');
jest.mock('../src/models/User');
jest.mock('../src/models/ExhibitorProfile');

describe('Task 06: Real-time Updates & Messaging Module Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('T06.8 & T06.9: Message Validation & REST Controller', () => {
    const senderId = new mongoose.Types.ObjectId();
    const receiverId = new mongoose.Types.ObjectId();

    it('should reject message when receiverId is missing', async () => {
      const req = {
        user: { id: senderId, role: 'attendee' },
        body: { content: 'Hello there' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await messageController.sendMessage(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Receiver ID is required.');
    });

    it('should reject message when sending to oneself', async () => {
      const req = {
        user: { id: senderId, role: 'attendee' },
        body: { receiverId: senderId, content: 'Talking to myself' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await messageController.sendMessage(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('You cannot send a message to yourself.');
    });

    it('should reject message when content is empty or only whitespace', async () => {
      const req = {
        user: { id: senderId, role: 'attendee' },
        body: { receiverId, content: '   ' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await messageController.sendMessage(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Message content cannot be empty.');
    });
  });

  describe('T06.11: Role-Based Communication Permissions', () => {
    const attendeeId = new mongoose.Types.ObjectId();
    const anotherAttendeeId = new mongoose.Types.ObjectId();
    const exhibitorId = new mongoose.Types.ObjectId();
    const adminId = new mongoose.Types.ObjectId();

    it('should forbid attendee to attendee direct messaging', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: anotherAttendeeId,
          name: 'Attendee Two',
          role: 'attendee',
        }),
      });

      const req = {
        user: { id: attendeeId, role: 'attendee' },
        body: { receiverId: anotherAttendeeId, content: 'Hey friend' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await messageController.sendMessage(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toMatch(/Direct messaging is reserved for inquiries between Attendees and Exhibitors/);
    });

    it('should permit attendee to exhibitor direct inquiry', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: exhibitorId,
          name: 'TechNova Rep',
          role: 'exhibitor',
        }),
      });

      const createdMsg = {
        _id: new mongoose.Types.ObjectId(),
        senderId: attendeeId,
        receiverId: exhibitorId,
        content: 'Tell me more about your robotics platform',
      };
      Message.create.mockResolvedValue(createdMsg);
      Message.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(createdMsg),
          }),
        }),
      });

      const mockIo = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
      const req = {
        user: { id: attendeeId, role: 'attendee' },
        body: { receiverId: exhibitorId, content: 'Tell me more about your robotics platform' },
        app: { get: jest.fn().mockReturnValue(mockIo) },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await messageController.sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockIo.to).toHaveBeenCalledWith(`user:${exhibitorId}`);
      expect(mockIo.to).toHaveBeenCalledWith(`user:${attendeeId}`);
    });

    it('should permit exhibitor to peer exhibitor neighbor chat', async () => {
      const peerExhibitorId = new mongoose.Types.ObjectId();
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: peerExhibitorId,
          name: 'Apex Robotics Rep',
          role: 'exhibitor',
        }),
      });

      const createdMsg = {
        _id: new mongoose.Types.ObjectId(),
        senderId: exhibitorId,
        receiverId: peerExhibitorId,
        content: 'Hi neighbor stall, would love to coordinate power drops.',
      };
      Message.create.mockResolvedValue(createdMsg);
      Message.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(createdMsg),
          }),
        }),
      });

      const mockIo = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
      const req = {
        user: { id: exhibitorId, role: 'exhibitor' },
        body: { receiverId: peerExhibitorId, content: 'Hi neighbor stall, would love to coordinate power drops.' },
        app: { get: jest.fn().mockReturnValue(mockIo) },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await messageController.sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should permit admin to communicate with any role', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: attendeeId,
          name: 'Sarah Jenkins',
          role: 'attendee',
        }),
      });

      const createdMsg = {
        _id: new mongoose.Types.ObjectId(),
        senderId: adminId,
        receiverId: attendeeId,
        content: 'Important VIP auditorium badge notice.',
      };
      Message.create.mockResolvedValue(createdMsg);
      Message.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(createdMsg),
          }),
        }),
      });

      const mockIo = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
      const req = {
        user: { id: adminId, role: 'admin' },
        body: { receiverId: attendeeId, content: 'Important VIP auditorium badge notice.' },
        app: { get: jest.fn().mockReturnValue(mockIo) },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await messageController.sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('T06.10: Unread Counting and Read Receipts', () => {
    it('should accurately return total unread count for the receiver', async () => {
      const currentUserId = new mongoose.Types.ObjectId();
      Message.countDocuments.mockResolvedValue(4);

      const req = { user: { id: currentUserId } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await messageController.getUnreadCount(req, res);

      expect(Message.countDocuments).toHaveBeenCalledWith({
        receiverId: currentUserId,
        readAt: null,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { unreadCount: 4 },
        })
      );
    });

    it('should mark messages as read and broadcast socket event to sender', async () => {
      const currentUserId = new mongoose.Types.ObjectId();
      const senderId = new mongoose.Types.ObjectId();

      Message.updateMany.mockResolvedValue({ modifiedCount: 3 });

      const mockIo = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
      const req = {
        user: { id: currentUserId },
        params: { senderId },
        app: { get: jest.fn().mockReturnValue(mockIo) },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await messageController.markMessagesAsRead(req, res);

      expect(Message.updateMany).toHaveBeenCalledWith(
        {
          senderId,
          receiverId: currentUserId,
          readAt: null,
        },
        { readAt: expect.any(Date) }
      );
      expect(mockIo.to).toHaveBeenCalledWith(`user:${senderId}`);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
