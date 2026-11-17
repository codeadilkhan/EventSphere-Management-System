const mongoose = require('mongoose');

const exhibitorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'General Technology',
    },
    contact: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        trim: true,
        default: '',
      },
      address: {
        type: String,
        trim: true,
        default: '',
      },
    },
    products: [
      {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
        category: { type: String, default: 'General' },
      },
    ],
    staff: [
      {
        name: { type: String, required: true, trim: true },
        role: { type: String, default: 'Booth Representative' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Text search on companyName, description, and product names
exhibitorProfileSchema.index({
  companyName: 'text',
  description: 'text',
  category: 'text',
  'products.name': 'text',
});

const ExhibitorProfile = mongoose.model('ExhibitorProfile', exhibitorProfileSchema);

module.exports = ExhibitorProfile;
