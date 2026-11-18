const Joi = require('joi');

const registerValidator = Joi.object({
  name: Joi.string().trim().min(2).max(60).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must have at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('exhibitor', 'attendee').default('attendee').messages({
    'any.only': 'Role must be either exhibitor or attendee',
  }),
  phone: Joi.string().allow('', null).trim(),
  consentGiven: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to the Terms of Service and Privacy Policy',
    'any.required': 'Terms consent is required',
  }),
});

const loginValidator = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const forgotPasswordValidator = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required',
  }),
});

const resetPasswordValidator = Joi.object({
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'New password is required',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required',
  }),
});

const changePasswordValidator = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters',
    'any.required': 'New password is required',
  }),
});

const expoValidator = Joi.object({
  title: Joi.string().trim().min(3).max(120).required().messages({
    'any.required': 'Expo title is required',
  }),
  description: Joi.string().trim().min(10).required().messages({
    'any.required': 'Expo description is required',
  }),
  theme: Joi.string().trim().max(80).required().messages({
    'any.required': 'Expo theme/industry is required',
  }),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Start date is required',
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
    'date.min': 'End date must be on or after start date',
    'any.required': 'End date is required',
  }),
  location: Joi.object({
    venue: Joi.string().trim().required().messages({
      'any.required': 'Venue name is required',
    }),
    city: Joi.string().trim().required().messages({
      'any.required': 'City is required',
    }),
    address: Joi.string().trim().allow('', null).default(''),
  }).required(),
  status: Joi.string().valid('draft', 'published', 'completed').default('draft'),
  bannerImage: Joi.string().allow('', null),
});

const boothValidator = Joi.object({
  expoId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Valid Expo ID is required',
  }),
  boothNumber: Joi.string().trim().uppercase().required().messages({
    'any.required': 'Booth number is required',
  }),
  size: Joi.string().trim().default('10x10'),
  price: Joi.number().min(0).required().messages({
    'any.required': 'Price is required',
  }),
  category: Joi.string().valid('Standard', 'Premium', 'Corner', 'Island').default('Standard'),
  position: Joi.object({
    row: Joi.number().integer().min(1).default(1),
    col: Joi.number().integer().min(1).default(1),
  }).default({ row: 1, col: 1 }),
  notes: Joi.string().allow('', null).default(''),
});

const bulkBoothValidator = Joi.object({
  expoId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Valid Expo ID is required',
  }),
  rows: Joi.number().integer().min(1).max(26).required().messages({
    'any.required': 'Number of rows is required (1-26)',
  }),
  cols: Joi.number().integer().min(1).max(30).required().messages({
    'any.required': 'Number of columns is required (1-30)',
  }),
  basePrice: Joi.number().min(0).default(500),
  defaultSize: Joi.string().default('10x10'),
  defaultCategory: Joi.string().valid('Standard', 'Premium', 'Corner', 'Island').default('Standard'),
});

const sessionValidator = Joi.object({
  expoId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Target Expo ID is required',
  }),
  title: Joi.string().trim().min(3).max(140).required().messages({
    'any.required': 'Session title is required',
  }),
  description: Joi.string().trim().min(10).required().messages({
    'any.required': 'Session description is required',
  }),
  speaker: Joi.object({
    name: Joi.string().trim().required().messages({
      'any.required': 'Speaker name is required',
    }),
    bio: Joi.string().allow('', null).default(''),
    company: Joi.string().allow('', null).default(''),
    role: Joi.string().allow('', null).default('Keynote Speaker'),
    photo: Joi.string().allow('', null).default(''),
  }).required(),
  topic: Joi.string().trim().required().messages({
    'any.required': 'Topic or track category is required',
  }),
  hall: Joi.string().trim().required().messages({
    'any.required': 'Hall or stage location is required',
  }),
  startTime: Joi.date().iso().required().messages({
    'any.required': 'Start time is required',
  }),
  endTime: Joi.date().iso().min(Joi.ref('startTime')).required().messages({
    'date.min': 'End time must be after start time',
    'any.required': 'End time is required',
  }),
  capacity: Joi.number().integer().min(5).default(100),
  status: Joi.string().valid('scheduled', 'ongoing', 'completed', 'cancelled').default('scheduled'),
});

const feedbackValidator = Joi.object({
  type: Joi.string().valid('issue', 'suggestion', 'inquiry').default('inquiry'),
  subject: Joi.string().trim().min(3).max(150).required().messages({
    'string.empty': 'Subject cannot be empty',
    'any.required': 'Subject is required',
  }),
  message: Joi.string().trim().min(5).max(3000).required().messages({
    'string.empty': 'Message cannot be empty',
    'any.required': 'Detailed message is required',
  }),
});

const updateProfileValidator = Joi.object({
  name: Joi.string().trim().min(2).max(60),
  phone: Joi.string().trim().allow('', null),
});

const deleteAccountValidator = Joi.object({
  password: Joi.string().required().messages({
    'any.required': 'Password confirmation is required to permanently delete your account',
  }),
});

const applicationValidator = Joi.object({
  expoId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Target Expo ID is required',
  }),
  companyName: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Company name is required',
  }),
  contactEmail: Joi.string().email().trim().lowercase().required().messages({
    'any.required': 'Contact email is required',
  }),
  contactPhone: Joi.string().trim().required().messages({
    'any.required': 'Contact phone is required',
  }),
  proposedProducts: Joi.string().trim().allow('', null).default(''),
  preferredBoothCategory: Joi.string().valid('Standard', 'Premium', 'Corner', 'Island').default('Standard'),
});

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  expoValidator,
  boothValidator,
  bulkBoothValidator,
  sessionValidator,
  feedbackValidator,
  updateProfileValidator,
  deleteAccountValidator,
  applicationValidator,
};
