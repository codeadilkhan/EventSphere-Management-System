const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    attendeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['expo', 'session'],
      default: 'session',
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registrations for the same user on the same session/expo
registrationSchema.index(
  { attendeeId: 1, expoId: 1, sessionId: 1, type: 1 },
  { unique: true }
);

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
