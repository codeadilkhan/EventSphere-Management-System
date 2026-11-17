const mongoose = require('mongoose');

const exhibitorApplicationSchema = new mongoose.Schema(
  {
    exhibitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Exhibitor user ID is required'],
      index: true,
    },
    expoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: [true, 'Target exhibition ID is required'],
      index: true,
    },
    companyDetails: {
      companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
      },
      website: {
        type: String,
        trim: true,
        default: '',
      },
      contactEmail: {
        type: String,
        required: [true, 'Contact email is required'],
        trim: true,
        lowercase: true,
      },
      contactPhone: {
        type: String,
        trim: true,
        default: '',
      },
    },
    productsServices: {
      type: String,
      required: [true, 'Please summarize the products or services you intend to exhibit'],
      trim: true,
    },
    documents: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredBoothIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booth',
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Application status must be pending, approved, or rejected',
      },
      default: 'pending',
      index: true,
    },
    adminRemarks: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One application per exhibitor per expo
exhibitorApplicationSchema.index({ exhibitorId: 1, expoId: 1 }, { unique: true });

const ExhibitorApplication = mongoose.model('ExhibitorApplication', exhibitorApplicationSchema);

module.exports = ExhibitorApplication;
