const mongoose = require('mongoose');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Expo = require('../models/Expo');
const Booth = require('../models/Booth');
const Session = require('../models/Session');
const Registration = require('../models/Registration');
const ExhibitorApplication = require('../models/ExhibitorApplication');
const Message = require('../models/Message');
const Feedback = require('../models/Feedback');
const { logEvent, seedSampleEventsIfEmpty } = require('../services/analyticsService');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Helper to sanitize CSV field
const escapeCsv = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// Track client interaction event (Public / Authenticated)
const trackEvent = asyncHandler(async (req, res, next) => {
  const { type, expoId, refId, refModel, metadata } = req.body;

  if (!type || !expoId) {
    return next(new ApiServiceException('Event type and expoId are required.', 400));
  }

  const event = await logEvent({
    type,
    expoId,
    refId,
    refModel,
    userId: req.user?.id || null,
    metadata,
  });

  return sendFormattedResponse(res, 201, true, { event }, 'Event tracked successfully.');
});

// Get KPI Overview Report (Admin)
const getOverview = asyncHandler(async (req, res) => {
  const { expoId } = req.query;
  const filter = {};

  if (expoId && mongoose.Types.ObjectId.isValid(expoId)) {
    filter.expoId = new mongoose.Types.ObjectId(expoId);
    // Background seed if expo is empty
    seedSampleEventsIfEmpty(expoId).catch(() => {});
  }

  // 1. Expo Info
  let expoDetails = null;
  if (filter.expoId) {
    expoDetails = await Expo.findById(filter.expoId).select('title venue city startDate endDate status').lean();
  }

  // 2. Booth Metrics
  const boothMatch = filter.expoId ? { expoId: filter.expoId } : {};
  const [boothStats, totalBoothsCount] = await Promise.all([
    Booth.aggregate([
      { $match: boothMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'allocated'] }, '$price', 0] } },
          potentialRevenue: { $sum: '$price' },
        },
      },
    ]),
    Booth.countDocuments(boothMatch),
  ]);

  let allocatedBooths = 0;
  let totalRevenue = 0;
  let potentialRevenue = 0;

  boothStats.forEach((stat) => {
    if (stat._id === 'allocated') {
      allocatedBooths = stat.count;
    }
    totalRevenue += stat.totalRevenue || 0;
    potentialRevenue += stat.potentialRevenue || 0;
  });

  const boothOccupancyRate = totalBoothsCount > 0 ? Math.round((allocatedBooths / totalBoothsCount) * 100) : 0;

  // 3. Attendee & Registration Metrics
  const regMatch = filter.expoId ? { expoId: filter.expoId } : {};
  const [distinctAttendees, totalExpoRegistrations, totalSessionRegistrations, totalBookmarks] = await Promise.all([
    Registration.distinct('attendeeId', regMatch),
    Registration.countDocuments({ ...regMatch, type: 'expo' }),
    Registration.countDocuments({ ...regMatch, type: 'session' }),
    Registration.countDocuments({ ...regMatch, bookmarked: true }),
  ]);

  // 4. Exhibitor Metrics
  const appMatch = filter.expoId ? { expoId: filter.expoId, status: 'approved' } : { status: 'approved' };
  const approvedExhibitors = await ExhibitorApplication.distinct('exhibitorId', appMatch);

  // 5. Session Metrics
  const sessionMatch = filter.expoId ? { expoId: filter.expoId } : {};
  const sessions = await Session.find(sessionMatch).select('capacity registeredCount').lean();
  const totalSessions = sessions.length;
  let totalSessionCapacity = 0;
  let totalRegisteredSeats = 0;

  sessions.forEach((s) => {
    totalSessionCapacity += s.capacity || 0;
    totalRegisteredSeats += s.registeredCount || 0;
  });

  const averageSessionFillRate =
    totalSessionCapacity > 0 ? Math.round((totalRegisteredSeats / totalSessionCapacity) * 100) : 0;

  // 6. Analytics Event Traffic Metrics
  const eventMatch = filter.expoId ? { expoId: filter.expoId } : {};
  const [pageViewsCount, boothViewsCount] = await Promise.all([
    AnalyticsEvent.countDocuments({ ...eventMatch, type: 'page_view' }),
    AnalyticsEvent.countDocuments({ ...eventMatch, type: 'booth_view' }),
  ]);

  // 7. Feedback Metrics
  const [totalFeedback, resolvedFeedback] = await Promise.all([
    Feedback.countDocuments(),
    Feedback.countDocuments({ status: 'resolved' }),
  ]);
  const feedbackResolutionRate = totalFeedback > 0 ? Math.round((resolvedFeedback / totalFeedback) * 100) : 100;

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      expo: expoDetails,
      overview: {
        totalAttendees: distinctAttendees.length,
        totalExpoRegistrations,
        totalSessionRegistrations,
        totalBookmarks,
        totalExhibitors: approvedExhibitors.length,
        booths: {
          total: totalBoothsCount,
          allocated: allocatedBooths,
          available: totalBoothsCount - allocatedBooths,
          occupancyRate: boothOccupancyRate,
          totalRevenue,
          potentialRevenue,
        },
        sessions: {
          total: totalSessions,
          totalCapacity: totalSessionCapacity,
          registeredSeats: totalRegisteredSeats,
          averageFillRate: averageSessionFillRate,
        },
        traffic: {
          pageViews: pageViewsCount,
          boothViews: boothViewsCount,
        },
        support: {
          totalTickets: totalFeedback,
          resolvedTickets: resolvedFeedback,
          resolutionRate: feedbackResolutionRate,
        },
      },
    },
    'Analytics overview loaded.'
  );
});

// Get Engagement Time-Series (Admin)
const getEngagement = asyncHandler(async (req, res) => {
  const { expoId } = req.query;
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 3), 60);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const matchFilter = { createdAt: { $gte: startDate } };
  if (expoId && mongoose.Types.ObjectId.isValid(expoId)) {
    matchFilter.expoId = new mongoose.Types.ObjectId(expoId);
    seedSampleEventsIfEmpty(expoId).catch(() => {});
  }

  // 1. Aggregate Analytics Events by Date & Type
  const eventAgg = await AnalyticsEvent.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          type: '$type',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // 2. Aggregate Registrations by Date
  const regAggFilter = { createdAt: { $gte: startDate } };
  if (expoId && mongoose.Types.ObjectId.isValid(expoId)) {
    regAggFilter.expoId = new mongoose.Types.ObjectId(expoId);
  }
  const regAgg = await Registration.aggregate([
    { $match: regAggFilter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);

  // 3. Aggregate Messages by Date
  const messageAgg = await Message.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);

  // Build contiguous date dictionary
  const timelineMap = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    timelineMap[dateStr] = {
      date: dateStr,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      registrations: 0,
      bookmarks: 0,
      pageViews: 0,
      boothViews: 0,
      messages: 0,
    };
  }

  // Populate events
  eventAgg.forEach((item) => {
    const { date, type } = item._id;
    if (timelineMap[date]) {
      if (type === 'page_view') timelineMap[date].pageViews += item.count;
      else if (type === 'booth_view') timelineMap[date].boothViews += item.count;
      else if (type === 'bookmark') timelineMap[date].bookmarks += item.count;
      else if (type === 'register') timelineMap[date].registrations += item.count;
    }
  });

  // Populate actual registrations
  regAgg.forEach((item) => {
    const date = item._id;
    if (timelineMap[date]) {
      timelineMap[date].registrations += item.count;
    }
  });

  // Populate messages
  messageAgg.forEach((item) => {
    const date = item._id;
    if (timelineMap[date]) {
      timelineMap[date].messages += item.count;
    }
  });

  const timeline = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));

  return sendFormattedResponse(res, 200, true, { days, timeline }, 'Engagement timeline loaded.');
});

// Get Booth Traffic Report (Admin)
const getBoothTraffic = asyncHandler(async (req, res) => {
  const { expoId } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

  const boothMatch = {};
  if (expoId && mongoose.Types.ObjectId.isValid(expoId)) {
    boothMatch.expoId = new mongoose.Types.ObjectId(expoId);
    seedSampleEventsIfEmpty(expoId).catch(() => {});
  }

  // Find all booths in scope
  const booths = await Booth.find(boothMatch)
    .populate('exhibitorId', 'name email company')
    .sort({ boothNumber: 1 })
    .lean();

  if (booths.length === 0) {
    return sendFormattedResponse(res, 200, true, { booths: [], totalViews: 0 }, 'No booths found.');
  }

  const boothIds = booths.map((b) => b._id);

  // Aggregate views per booth from AnalyticsEvent
  const viewCounts = await AnalyticsEvent.aggregate([
    {
      $match: {
        type: 'booth_view',
        refId: { $in: boothIds },
      },
    },
    {
      $group: {
        _id: '$refId',
        views: { $sum: 1 },
      },
    },
  ]);

  const viewsMap = {};
  let totalViews = 0;
  viewCounts.forEach((v) => {
    viewsMap[v._id.toString()] = v.views;
    totalViews += v.views;
  });

  // Combine and sort
  const enrichedBooths = booths.map((b) => {
    const views = viewsMap[b._id.toString()] || 0;
    const exhibitorName = b.exhibitorId?.name || (b.status === 'allocated' ? 'Commercial Exhibitor' : 'Unallocated');
    return {
      _id: b._id,
      boothNumber: b.boothNumber,
      category: b.category,
      price: b.price,
      size: b.size,
      status: b.status,
      exhibitorName,
      views,
      trafficShare: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
    };
  });

  enrichedBooths.sort((a, b) => b.views - a.views || a.boothNumber.localeCompare(b.boothNumber));
  const topBooths = enrichedBooths.slice(0, limit);

  // Category distribution
  const categoryStats = { Standard: 0, Premium: 0, Corner: 0, Island: 0 };
  booths.forEach((b) => {
    if (categoryStats[b.category] !== undefined) {
      categoryStats[b.category]++;
    }
  });

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      totalBooths: booths.length,
      totalViews,
      topBooths,
      categoryDistribution: Object.entries(categoryStats).map(([name, count]) => ({
        name,
        count,
        percentage: booths.length > 0 ? Math.round((count / booths.length) * 100) : 0,
      })),
    },
    'Booth traffic report generated.'
  );
});

// Get Session Popularity Report (Admin)
const getSessionPopularity = asyncHandler(async (req, res) => {
  const { expoId } = req.query;

  const sessionMatch = {};
  if (expoId && mongoose.Types.ObjectId.isValid(expoId)) {
    sessionMatch.expoId = new mongoose.Types.ObjectId(expoId);
  }

  const sessions = await Session.find(sessionMatch)
    .populate('expoId', 'title venue city')
    .sort({ registeredCount: -1, capacity: -1 })
    .lean();

  const formattedSessions = sessions.map((s) => {
    const fillRate = s.capacity > 0 ? Math.round(((s.registeredCount || 0) / s.capacity) * 100) : 0;
    return {
      _id: s._id,
      title: s.title,
      speakerName: s.speaker?.name || 'Keynote Speaker',
      speakerRole: s.speaker?.role || 'Guest Speaker',
      hall: s.hall,
      topic: s.topic,
      startTime: s.startTime,
      endTime: s.endTime,
      capacity: s.capacity,
      registeredCount: s.registeredCount || 0,
      availableSeats: Math.max(0, s.capacity - (s.registeredCount || 0)),
      fillRate,
      status: s.status,
      expoTitle: s.expoId?.title || 'Exhibition',
    };
  });

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      count: formattedSessions.length,
      sessions: formattedSessions,
    },
    'Session popularity report generated.'
  );
});

// Export Report as CSV (Admin)
const exportReportCsv = asyncHandler(async (req, res, next) => {
  const { expoId, type = 'overview' } = req.query;

  let csvRows = [];
  let filename = `eventsphere-${type}-${Date.now()}.csv`;

  if (type === 'booths') {
    const boothMatch = expoId && mongoose.Types.ObjectId.isValid(expoId) ? { expoId } : {};
    const booths = await Booth.find(boothMatch).populate('exhibitorId', 'name email').lean();

    const headers = ['Booth Number', 'Category', 'Size', 'Price ($)', 'Status', 'Exhibitor Name', 'Exhibitor Email', 'Notes'];
    csvRows.push(headers.join(','));

    booths.forEach((b) => {
      csvRows.push(
        [
          escapeCsv(b.boothNumber),
          escapeCsv(b.category),
          escapeCsv(b.size),
          escapeCsv(b.price),
          escapeCsv(b.status),
          escapeCsv(b.exhibitorId?.name || 'N/A'),
          escapeCsv(b.exhibitorId?.email || 'N/A'),
          escapeCsv(b.notes || ''),
        ].join(',')
      );
    });
  } else if (type === 'sessions') {
    const sessionMatch = expoId && mongoose.Types.ObjectId.isValid(expoId) ? { expoId } : {};
    const sessions = await Session.find(sessionMatch).lean();

    const headers = ['Title', 'Speaker', 'Topic', 'Hall', 'Start Time', 'End Time', 'Capacity', 'Registered', 'Fill Rate %', 'Status'];
    csvRows.push(headers.join(','));

    sessions.forEach((s) => {
      const fillRate = s.capacity > 0 ? Math.round(((s.registeredCount || 0) / s.capacity) * 100) : 0;
      csvRows.push(
        [
          escapeCsv(s.title),
          escapeCsv(s.speaker?.name || 'N/A'),
          escapeCsv(s.topic),
          escapeCsv(s.hall),
          escapeCsv(s.startTime ? new Date(s.startTime).toISOString() : ''),
          escapeCsv(s.endTime ? new Date(s.endTime).toISOString() : ''),
          escapeCsv(s.capacity),
          escapeCsv(s.registeredCount || 0),
          escapeCsv(fillRate),
          escapeCsv(s.status),
        ].join(',')
      );
    });
  } else if (type === 'engagement') {
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchFilter = { createdAt: { $gte: startDate } };
    if (expoId && mongoose.Types.ObjectId.isValid(expoId)) {
      matchFilter.expoId = new mongoose.Types.ObjectId(expoId);
    }

    const events = await AnalyticsEvent.find(matchFilter).sort({ createdAt: -1 }).limit(1000).lean();

    const headers = ['Event ID', 'Type', 'Expo ID', 'Reference ID', 'Model', 'User ID', 'Date & Time'];
    csvRows.push(headers.join(','));

    events.forEach((e) => {
      csvRows.push(
        [
          escapeCsv(e._id),
          escapeCsv(e.type),
          escapeCsv(e.expoId),
          escapeCsv(e.refId || 'N/A'),
          escapeCsv(e.refModel || 'N/A'),
          escapeCsv(e.userId || 'Anonymous'),
          escapeCsv(new Date(e.createdAt).toISOString()),
        ].join(',')
      );
    });
  } else {
    // Overview CSV
    const boothMatch = expoId && mongoose.Types.ObjectId.isValid(expoId) ? { expoId } : {};
    const regMatch = expoId && mongoose.Types.ObjectId.isValid(expoId) ? { expoId } : {};

    const [totalBooths, allocatedBooths, totalAttendees, totalSessions] = await Promise.all([
      Booth.countDocuments(boothMatch),
      Booth.countDocuments({ ...boothMatch, status: 'allocated' }),
      Registration.distinct('attendeeId', regMatch),
      Session.countDocuments(boothMatch),
    ]);

    const headers = ['Metric', 'Value', 'Generated At'];
    csvRows.push(headers.join(','));
    const nowStr = new Date().toISOString();

    csvRows.push([escapeCsv('Total Registered Attendees'), escapeCsv(totalAttendees.length), escapeCsv(nowStr)].join(','));
    csvRows.push([escapeCsv('Total Booths'), escapeCsv(totalBooths), escapeCsv(nowStr)].join(','));
    csvRows.push([escapeCsv('Allocated Stalls'), escapeCsv(allocatedBooths), escapeCsv(nowStr)].join(','));
    csvRows.push([escapeCsv('Stall Occupancy Rate'), escapeCsv(`${totalBooths > 0 ? Math.round((allocatedBooths / totalBooths) * 100) : 0}%`), escapeCsv(nowStr)].join(','));
    csvRows.push([escapeCsv('Total Sessions'), escapeCsv(totalSessions), escapeCsv(nowStr)].join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csvRows.join('\r\n'));
});

module.exports = {
  trackEvent,
  getOverview,
  getEngagement,
  getBoothTraffic,
  getSessionPopularity,
  exportReportCsv,
};
