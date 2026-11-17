const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema(
  {
    expoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: [true, 'Booth must belong to a specific Expo'],
      index: true,
    },
    boothNumber: {
      type: String,
      required: [true, 'Booth number is required (e.g. A-01)'],
      trim: true,
      uppercase: true,
    },
    size: {
      type: String,
      default: '10x10',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Booth price is required'],
      min: [0, 'Price cannot be negative'],
      default: 500,
    },
    category: {
      type: String,
      enum: {
        values: ['Standard', 'Premium', 'Corner', 'Island'],
        message: 'Category must be Standard, Premium, Corner, or Island',
      },
      default: 'Standard',
    },
    position: {
      row: {
        type: Number,
        default: 1,
        min: 1,
      },
      col: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'reserved', 'allocated'],
        message: 'Status must be available, reserved, or allocated',
      },
      default: 'available',
      index: true,
    },
    exhibitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    allocatedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: boothNumber must be unique within an expo
boothSchema.index({ expoId: 1, boothNumber: 1 }, { unique: true });

const Booth = mongoose.model('Booth', boothSchema);

module.exports = Booth;
