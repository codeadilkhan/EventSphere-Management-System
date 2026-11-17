const mongoose = require('mongoose');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Booth = require('../models/Booth');
const Session = require('../models/Session');

let io = null;

/**
 * Configure active Socket.io instance for live analytics streaming
 */
const setSocketIoInstance = (ioInstance) => {
  io = ioInstance;
};

/**
 * Safely record an analytics interaction event (non-blocking)
 * @param {Object} eventData - { type, expoId, refId, refModel, userId, metadata }
 */
const logEvent = async (eventData) => {
  try {
    const { type, expoId, refId = null, refModel = null, userId = null, metadata = {} } = eventData;

    if (!type || !expoId) {
      return null;
    }

    // In test environment without active DB connection or mock, avoid buffering timeout
    if (process.env.NODE_ENV === 'test' && mongoose.connection?.readyState === 0 && !AnalyticsEvent.create?.mock) {
      return null;
    }

    const event = await AnalyticsEvent.create({
      type,
      expoId,
      refId,
      refModel,
      userId,
      metadata,
      createdAt: new Date(),
    });

    // Broadcast live event to admin dashboard room if Socket.io is connected
    if (io) {
      io.to('admin').emit('analytics:new_event', {
        type: event.type,
        expoId: event.expoId,
        refId: event.refId,
        createdAt: event.createdAt,
      });

      if (expoId) {
        io.to(`expo:${expoId}`).emit('analytics:expo_event', {
          type: event.type,
          createdAt: event.createdAt,
        });
      }
    }

    return event;
  } catch (error) {
    // Non-blocking: analytics logging should never crash the main application flow
    console.warn('[Analytics Service] Failed to record event:', error.message);
    return null;
  }
};

/**
 * Seed realistic historical events for an expo if no events exist yet
 * Ensures demo dashboards and visual graphs look rich immediately
 */
const seedSampleEventsIfEmpty = async (expoId) => {
  try {
    if (!expoId) return;

    const count = await AnalyticsEvent.countDocuments({ expoId });
    if (count > 0) return; // Already has events

    if (typeof Booth.find !== 'function' || typeof Session.find !== 'function') return;

    const boothQuery = Booth.find({ expoId });
    const sessionQuery = Session.find({ expoId });

    const [booths, sessions] = await Promise.all([
      boothQuery && typeof boothQuery.limit === 'function' ? boothQuery.limit(8).lean() : Promise.resolve([]),
      sessionQuery && typeof sessionQuery.limit === 'function' ? sessionQuery.limit(5).lean() : Promise.resolve([]),
    ]);

    const eventsToInsert = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Generate events over the last 14 days
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const baseTime = now - dayOffset * dayMs;
      // Daily page views
      const pageViewsCount = Math.floor(15 + Math.random() * 25 + (14 - dayOffset) * 3);
      for (let i = 0; i < pageViewsCount; i++) {
        eventsToInsert.push({
          type: 'page_view',
          expoId,
          createdAt: new Date(baseTime + Math.random() * (dayMs - 1000)),
        });
      }

      // Booth views
      if (booths.length > 0) {
        const boothViewsCount = Math.floor(10 + Math.random() * 18 + (14 - dayOffset) * 2);
        for (let i = 0; i < boothViewsCount; i++) {
          const selectedBooth = booths[Math.floor(Math.random() * booths.length)];
          eventsToInsert.push({
            type: 'booth_view',
            expoId,
            refId: selectedBooth._id,
            refModel: 'Booth',
            metadata: { boothNumber: selectedBooth.boothNumber },
            createdAt: new Date(baseTime + Math.random() * (dayMs - 1000)),
          });
        }
      }

      // Session views & bookmarks
      if (sessions.length > 0) {
        const sessionEventsCount = Math.floor(5 + Math.random() * 12);
        for (let i = 0; i < sessionEventsCount; i++) {
          const selectedSession = sessions[Math.floor(Math.random() * sessions.length)];
          const isBookmark = Math.random() > 0.6;
          eventsToInsert.push({
            type: isBookmark ? 'bookmark' : 'session_view',
            expoId,
            refId: selectedSession._id,
            refModel: 'Session',
            metadata: { title: selectedSession.title },
            createdAt: new Date(baseTime + Math.random() * (dayMs - 1000)),
          });
        }
      }
    }

    if (eventsToInsert.length > 0) {
      await AnalyticsEvent.insertMany(eventsToInsert);
      console.log(`[Analytics Service] Seeded ${eventsToInsert.length} demo events for expo ${expoId}`);
    }
  } catch (error) {
    console.warn('[Analytics Service] Demo seeding skipped:', error.message);
  }
};

module.exports = {
  setSocketIoInstance,
  logEvent,
  seedSampleEventsIfEmpty,
};
