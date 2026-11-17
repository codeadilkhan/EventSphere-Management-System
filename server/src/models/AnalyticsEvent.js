const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['page_view', 'booth_view', 'session_view', 'register', 'bookmark'],
      required: [true, 'Event type is required'],
      index: true,
    },
    expoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: [true, 'Expo ID is required'],
      index: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    refModel: {
      type: String,
      enum: ['Booth', 'Session', 'User', 'ExhibitorProfile', null],
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound indexes for rapid aggregation and analytics queries
analyticsEventSchema.index({ expoId: 1, type: 1, createdAt: -1 });
analyticsEventSchema.index({ expoId: 1, refId: 1, type: 1 });
analyticsEventSchema.index({ type: 1, createdAt: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;
