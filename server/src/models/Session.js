const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    expoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: [true, 'Session must belong to an exhibition'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Session description is required'],
      trim: true,
    },
    speaker: {
      name: { type: String, required: [true, 'Speaker name is required'], trim: true },
      bio: { type: String, default: '', trim: true },
      company: { type: String, default: '', trim: true },
      role: { type: String, default: 'Keynote Speaker', trim: true },
      photo: { type: String, default: '' },
    },
    topic: {
      type: String,
      required: [true, 'Session topic/track is required'],
      trim: true,
    },
    hall: {
      type: String,
      required: [true, 'Hall or location is required'],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [5, 'Capacity must be at least 5'],
      default: 100,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        message: 'Status must be scheduled, ongoing, completed, or cancelled',
      },
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for schedule conflict detection and fast querying
sessionSchema.index({ expoId: 1, hall: 1, startTime: 1, endTime: 1 });
sessionSchema.index({ expoId: 1, startTime: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
