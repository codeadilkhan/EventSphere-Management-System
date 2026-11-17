const mongoose = require('mongoose');
const AnalyticsEvent = require('../src/models/AnalyticsEvent');
const Expo = require('../src/models/Expo');
const Booth = require('../src/models/Booth');
const Session = require('../src/models/Session');
const Registration = require('../src/models/Registration');
const ExhibitorApplication = require('../src/models/ExhibitorApplication');
const Message = require('../src/models/Message');
const Feedback = require('../src/models/Feedback');
const analyticsController = require('../src/controllers/analyticsController');
const { logEvent } = require('../src/services/analyticsService');
const { authorize } = require('../src/middleware/authMiddleware');

// Mock Mongoose models
jest.mock('../src/models/AnalyticsEvent');
jest.mock('../src/models/Expo');
jest.mock('../src/models/Booth');
jest.mock('../src/models/Session');
jest.mock('../src/models/Registration');
jest.mock('../src/models/ExhibitorApplication');
jest.mock('../src/models/Message');
jest.mock('../src/models/Feedback');
jest.mock('../src/models/User');

describe('Task 08: Analytics & Reporting Module Tests', () => {
  const expoId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();
  const boothId = new mongoose.Types.ObjectId();
  const sessionId = new mongoose.Types.ObjectId();

  afterEach(() => {
    jest.clearAllMocks();
  });

  // T08.1 - T08.3: Data Collection & Logging
  describe('T08.1 - T08.3: AnalyticsEvent Collection & Tracking', () => {
    it('should create an analytics event via logEvent service without throwing', async () => {
      const mockEvent = {
        _id: new mongoose.Types.ObjectId(),
        type: 'booth_view',
        expoId,
        refId: boothId,
        refModel: 'Booth',
        userId,
        createdAt: new Date(),
      };

      AnalyticsEvent.create.mockResolvedValue(mockEvent);

      const result = await logEvent({
        type: 'booth_view',
        expoId,
        refId: boothId,
        refModel: 'Booth',
        userId,
        metadata: { boothNumber: 'A-01' },
      });

      expect(AnalyticsEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'booth_view',
          expoId,
          refId: boothId,
          refModel: 'Booth',
          userId,
        })
      );
      expect(result.type).toBe('booth_view');
    });

    it('should track client interaction via trackEvent endpoint', async () => {
      const mockCreated = {
        _id: new mongoose.Types.ObjectId(),
        type: 'page_view',
        expoId,
      };
      AnalyticsEvent.create.mockResolvedValue(mockCreated);

      const req = {
        body: { type: 'page_view', expoId: expoId.toString() },
        user: { id: userId },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await analyticsController.trackEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Event tracked successfully.',
        })
      );
    });

    it('should reject trackEvent when type or expoId is missing', async () => {
      const req = {
        body: { type: '' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await analyticsController.trackEvent(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('required');
    });
  });

  // T08.4: Overview Aggregation
  describe('T08.4: Executive Overview Aggregation', () => {
    it('should aggregate accurate KPIs and verify calculated occupancy rate and revenue', async () => {
      Expo.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            title: 'Global Tech Expo 2026',
            venue: 'Tech City Center',
          }),
        }),
      });

      // 10 total booths: 6 allocated ($1,000 each = $6,000), 4 vacant ($800 each = $3,200). Total potential = $9,200
      Booth.aggregate.mockResolvedValue([
        { _id: 'allocated', count: 6, totalRevenue: 6000, potentialRevenue: 6000 },
        { _id: 'available', count: 4, totalRevenue: 0, potentialRevenue: 3200 },
      ]);
      Booth.countDocuments.mockResolvedValue(10);

      // Attendees
      Registration.distinct.mockResolvedValue([new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]);
      Registration.countDocuments
        .mockResolvedValueOnce(2) // totalExpoRegistrations
        .mockResolvedValueOnce(5) // totalSessionRegistrations
        .mockResolvedValueOnce(3); // totalBookmarks

      // Exhibitors
      ExhibitorApplication.distinct.mockResolvedValue([new mongoose.Types.ObjectId()]);

      // Sessions: 2 sessions, total capacity = 200, registered = 150 (fill rate = 75%)
      Session.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { capacity: 100, registeredCount: 80 },
            { capacity: 100, registeredCount: 70 },
          ]),
        }),
      });

      // Analytics events
      AnalyticsEvent.countDocuments
        .mockResolvedValueOnce(450) // page views
        .mockResolvedValueOnce(180); // booth views

      // Feedback
      Feedback.countDocuments
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(9); // resolved (90%)

      const req = { query: { expoId: expoId.toString() } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await analyticsController.getOverview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0].data.overview;

      // Acceptance Criteria: Numbers match raw data (spot-check 3 values)
      // 1. Occupancy rate: 6 / 10 = 60%
      expect(responseData.booths.occupancyRate).toBe(60);
      // 2. Total revenue from allocated booths: $6,000
      expect(responseData.booths.totalRevenue).toBe(6000);
      // 3. Average session fill rate: (150 / 200) * 100 = 75%
      expect(responseData.sessions.averageFillRate).toBe(75);
      // 4. Distinct attendees count
      expect(responseData.totalAttendees).toBe(2);
    });
  });

  // T08.5: Engagement Aggregation
  describe('T08.5: Engagement Daily Time-Series', () => {
    it('should return contiguous timeline data for the requested days window', async () => {
      AnalyticsEvent.aggregate.mockResolvedValue([
        { _id: { date: '2026-11-16', type: 'page_view' }, count: 25 },
        { _id: { date: '2026-11-16', type: 'booth_view' }, count: 12 },
        { _id: { date: '2026-11-16', type: 'bookmark' }, count: 5 },
      ]);
      Registration.aggregate.mockResolvedValue([
        { _id: '2026-11-16', count: 8 },
      ]);
      Message.aggregate.mockResolvedValue([
        { _id: '2026-11-16', count: 14 },
      ]);

      const req = { query: { expoId: expoId.toString(), days: '7' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await analyticsController.getEngagement(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data;
      expect(data.days).toBe(7);
      expect(Array.isArray(data.timeline)).toBe(true);
      expect(data.timeline.length).toBe(7);

      // Verify contiguous entries have fields
      const entry = data.timeline[0];
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('registrations');
      expect(entry).toHaveProperty('bookmarks');
      expect(entry).toHaveProperty('pageViews');
    });
  });

  // T08.6: Booth Traffic Aggregation
  describe('T08.6: Commercial Booth Footfall & Traffic', () => {
    it('should aggregate views per booth and rank them with category distribution', async () => {
      const mockBooths = [
        {
          _id: boothId,
          boothNumber: 'A-01',
          category: 'Premium',
          price: 1500,
          status: 'allocated',
          exhibitorId: { name: 'Acme Corp', company: 'Acme Technologies' },
        },
        {
          _id: new mongoose.Types.ObjectId(),
          boothNumber: 'B-04',
          category: 'Standard',
          price: 800,
          status: 'available',
          exhibitorId: null,
        },
      ];

      Booth.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockBooths),
          }),
        }),
      });

      AnalyticsEvent.aggregate.mockResolvedValue([
        { _id: boothId, views: 42 },
      ]);

      const req = { query: { expoId: expoId.toString(), limit: '10' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await analyticsController.getBoothTraffic(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data;
      expect(data.totalBooths).toBe(2);
      expect(data.totalViews).toBe(42);
      expect(data.topBooths[0].boothNumber).toBe('A-01');
      expect(data.topBooths[0].views).toBe(42);
      expect(data.topBooths[0].trafficShare).toBe(100);
      expect(data.categoryDistribution.some((c) => c.name === 'Premium')).toBe(true);
    });
  });

  // T08.7: Session Popularity Aggregation
  describe('T08.7: Session Popularity & Capacity Utilization', () => {
    it('should list sessions ranked by registered count with accurate fill rate', async () => {
      const mockSessions = [
        {
          _id: sessionId,
          title: 'AI in 2026 Keynote',
          speaker: { name: 'Dr. Jane Doe', role: 'Chief Scientist' },
          hall: 'Hall A',
          topic: 'Artificial Intelligence',
          capacity: 100,
          registeredCount: 85,
          status: 'scheduled',
          expoId: { title: 'Global Tech Expo 2026' },
        },
      ];

      Session.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockSessions),
          }),
        }),
      });

      const req = { query: { expoId: expoId.toString() } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await analyticsController.getSessionPopularity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data;
      expect(data.count).toBe(1);
      expect(data.sessions[0].title).toBe('AI in 2026 Keynote');
      expect(data.sessions[0].fillRate).toBe(85);
      expect(data.sessions[0].availableSeats).toBe(15);
    });
  });

  // T08.12: CSV Export Functionality
  describe('T08.12: Export Reports to CSV', () => {
    it('should export booth data as downloadable CSV with appropriate headers', async () => {
      const mockBooths = [
        {
          boothNumber: 'A-01',
          category: 'Premium',
          size: '10x20',
          price: 1500,
          status: 'allocated',
          exhibitorId: { name: 'Acme Corp', email: 'acme@example.com' },
          notes: 'Corner location',
        },
      ];

      Booth.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockBooths),
        }),
      });

      const req = { query: { expoId: expoId.toString(), type: 'booths' } };
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const next = jest.fn();

      await analyticsController.exportReportCsv(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename=')
      );
      expect(res.status).toHaveBeenCalledWith(200);

      const csvContent = res.send.mock.calls[0][0];
      expect(csvContent).toContain('Booth Number,Category,Size,Price ($)');
      expect(csvContent).toContain('"A-01"');
      expect(csvContent).toContain('"Acme Corp"');
    });

    it('should export keynote sessions data as downloadable CSV', async () => {
      const mockSessions = [
        {
          title: 'Quantum Computing Frontiers',
          speaker: { name: 'Prof. Miller' },
          topic: 'Quantum Computing',
          hall: 'Hall C',
          capacity: 80,
          registeredCount: 60,
          status: 'scheduled',
        },
      ];

      Session.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockSessions),
      });

      const req = { query: { expoId: expoId.toString(), type: 'sessions' } };
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const next = jest.fn();

      await analyticsController.exportReportCsv(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const csvContent = res.send.mock.calls[0][0];
      expect(csvContent).toContain('Title,Speaker,Topic,Hall');
      expect(csvContent).toContain('"Quantum Computing Frontiers"');
      expect(csvContent).toContain('"Prof. Miller"');
    });
  });

  // Security: RBAC Authorization
  describe('RBAC Authorization: Admin Analytics Protection', () => {
    it('should reject non-admin users with 403 Forbidden', () => {
      const adminMiddleware = authorize('admin');
      const req = { user: { role: 'attendee' } };
      const res = {};
      const next = jest.fn();

      adminMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toContain('Access restricted');
    });

    it('should permit admin users to proceed to analytics', () => {
      const adminMiddleware = authorize('admin');
      const req = { user: { role: 'admin' } };
      const res = {};
      const next = jest.fn();

      adminMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // called with no error argument
    });
  });
});
