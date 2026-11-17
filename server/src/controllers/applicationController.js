const ExhibitorApplication = require('../models/ExhibitorApplication');
const Expo = require('../models/Expo');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { notify } = require('../services/notificationService');
const { sendApplicationStatusEmail } = require('../services/emailService');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Submit Expo Application (Exhibitor)
const submitApplication = asyncHandler(async (req, res, next) => {
  const { expoId, companyDetails, productsServices, preferredBoothIds } = req.body;

  // Verify Expo exists
  const targetExpo = await Expo.findById(expoId);
  if (!targetExpo) {
    return next(new ApiServiceException('Target exhibition does not exist.', 404));
  }

  // Prevent duplicate applications
  const existingApp = await ExhibitorApplication.findOne({
    exhibitorId: req.user.id,
    expoId,
  });

  if (existingApp) {
    return next(
      new ApiServiceException(
        `You have already submitted an application for "${targetExpo.title}". Current status: ${existingApp.status.toUpperCase()}.`,
        400
      )
    );
  }

  // Collect uploaded documents if Multer processed files
  let documentPaths = [];
  if (req.files && Array.isArray(req.files)) {
    documentPaths = req.files.map((file) => `/uploads/${file.filename}`);
  } else if (req.body.documents) {
    documentPaths = Array.isArray(req.body.documents) ? req.body.documents : [req.body.documents];
  }

  let parsedCompanyDetails = companyDetails;
  if (typeof companyDetails === 'string') {
    try {
      parsedCompanyDetails = JSON.parse(companyDetails);
    } catch {
      parsedCompanyDetails = {
        companyName: req.user.name,
        contactEmail: req.user.email,
      };
    }
  }

  let parsedBooths = preferredBoothIds;
  if (typeof preferredBoothIds === 'string') {
    try {
      parsedBooths = JSON.parse(preferredBoothIds);
    } catch {
      parsedBooths = [];
    }
  }

  const application = await ExhibitorApplication.create({
    exhibitorId: req.user.id,
    expoId,
    companyDetails: parsedCompanyDetails || {
      companyName: req.user.name,
      contactEmail: req.user.email,
      contactPhone: req.user.phone || '',
    },
    productsServices,
    documents: documentPaths,
    preferredBoothIds: parsedBooths || [],
    status: 'pending',
  });

  // Notify Admins
  await Notification.create({
    userId: targetExpo.createdBy,
    type: 'application_update',
    title: 'New Exhibitor Application',
    message: `${req.user.name} submitted an application for "${targetExpo.title}".`,
    link: `/admin/applications?expoId=${expoId}`,
  });

  return sendFormattedResponse(
    res,
    201,
    true,
    { application },
    'Application submitted successfully. Awaiting organizer review.'
  );
});

// Get My Applications (Exhibitor)
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await ExhibitorApplication.find({ exhibitorId: req.user.id })
    .populate('expoId', 'title startDate endDate location bannerImage status')
    .populate('preferredBoothIds', 'boothNumber category size price status')
    .sort({ createdAt: -1 });

  return sendFormattedResponse(
    res,
    200,
    true,
    { applications },
    'My applications loaded.'
  );
});

// Get All Applications (Admin)
const getAllApplications = asyncHandler(async (req, res) => {
  const { expoId, status } = req.query;

  const queryFilter = {};
  if (expoId) queryFilter.expoId = expoId;
  if (status && status !== 'ALL') queryFilter.status = status;

  const applications = await ExhibitorApplication.find(queryFilter)
    .populate('exhibitorId', 'name email phone')
    .populate('expoId', 'title startDate endDate location status')
    .populate('preferredBoothIds', 'boothNumber category size price status')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });

  return sendFormattedResponse(
    res,
    200,
    true,
    { count: applications.length, applications },
    'All applications retrieved.'
  );
});

// Review Application: Approve or Reject (Admin)
const reviewApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, adminRemarks } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return next(new ApiServiceException('Status must be approved, rejected, or pending.', 400));
  }

  const application = await ExhibitorApplication.findById(id).populate('expoId', 'title');
  if (!application) {
    return next(new ApiServiceException('Application record not found.', 404));
  }

  application.status = status;
  application.adminRemarks = adminRemarks || '';
  application.reviewedBy = req.user.id;
  application.reviewedAt = new Date();

  await application.save();

  // Dispatch in-app and real-time socket notification
  const expoTitle = application.expoId?.title || 'Trade Expo';
  await notify(application.exhibitorId, {
    type: 'application_update',
    title: `Exhibition Application ${status.toUpperCase()}`,
    message: `Your application for "${expoTitle}" has been ${status}. ${
      adminRemarks ? `Organizer Remarks: "${adminRemarks}"` : ''
    }`,
    link: status === 'approved' ? `/exhibitor/booths?expoId=${application.expoId?._id}` : '/exhibitor/applications',
  });

  // Dispatch email notification
  const exhibitorUser = await User.findById(application.exhibitorId).select('name email');
  if (exhibitorUser && exhibitorUser.email) {
    sendApplicationStatusEmail(
      exhibitorUser.email,
      exhibitorUser.name,
      expoTitle,
      status,
      adminRemarks
    ).catch(() => {});
  }

  return sendFormattedResponse(
    res,
    200,
    true,
    { application },
    `Application has been marked as ${status}.`
  );
});

module.exports = {
  submitApplication,
  getMyApplications,
  getAllApplications,
  reviewApplication,
};
