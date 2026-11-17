const mongoose = require('mongoose');

const expoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an expo title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
    },
    theme: {
      type: String,
      required: [true, 'Please provide a theme or industry focus'],
      trim: true,
      maxlength: [80, 'Theme cannot exceed 80 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide an expo start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an expo end date'],
      validate: {
        validator: function (val) {
          return val >= this.startDate;
        },
        message: 'End date must be on or after the start date',
      },
    },
    location: {
      venue: {
        type: String,
        required: [true, 'Venue name is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      address: {
        type: String,
        trim: true,
        default: '',
      },
    },
    bannerImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'completed'],
        message: 'Status must be draft, published, or completed',
      },
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for counting booths
expoSchema.virtual('booths', {
  ref: 'Booth',
  localField: '_id',
  foreignField: 'expoId',
});

// Index for search & status queries
expoSchema.index({ status: 1, startDate: 1 });
expoSchema.index({ title: 'text', theme: 'text', description: 'text' });

const Expo = mongoose.model('Expo', expoSchema);

module.exports = Expo;
