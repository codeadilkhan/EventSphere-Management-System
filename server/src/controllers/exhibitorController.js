const ExhibitorProfile = require('../models/ExhibitorProfile');
const User = require('../models/User');
const Booth = require('../models/Booth');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Get currently logged-in exhibitor's profile (or initialize default)
const getMyProfile = asyncHandler(async (req, res) => {
  let profile = await ExhibitorProfile.findOne({ userId: req.user.id });

  if (!profile) {
    // Auto-initialize profile using User account details
    profile = await ExhibitorProfile.create({
      userId: req.user.id,
      companyName: req.user.name,
      contact: {
        email: req.user.email,
        phone: req.user.phone || '',
      },
    });
  }

  // Find booths allocated to this exhibitor across all expos
  const allocatedBooths = await Booth.find({ exhibitorId: req.user.id }).populate('expoId', 'title startDate endDate location status');

  return sendFormattedResponse(
    res,
    200,
    true,
    { profile, allocatedBooths },
    'Exhibitor profile loaded.'
  );
});

// Update exhibitor profile & product showcase
const updateMyProfile = asyncHandler(async (req, res, next) => {
  const { companyName, description, website, category, contact, products, staff, logo } = req.body;

  let profile = await ExhibitorProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = new ExhibitorProfile({ userId: req.user.id });
  }

  if (companyName) profile.companyName = companyName;
  if (description !== undefined) profile.description = description;
  if (website !== undefined) profile.website = website;
  if (category) profile.category = category;
  if (contact) profile.contact = { ...profile.contact, ...contact };
  if (products) profile.products = products;
  if (staff) profile.staff = staff;
  if (logo) profile.logo = logo;

  await profile.save();

  return sendFormattedResponse(res, 200, true, { profile }, 'Profile updated successfully.');
});

// Upload company logo
const uploadLogoImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiServiceException('No logo image file was provided.', 400));
  }

  const relativePath = `/uploads/${req.file.filename}`;
  return sendFormattedResponse(
    res,
    200,
    true,
    { logoPath: relativePath },
    'Company logo uploaded successfully.'
  );
});

// Get Public Exhibitor Profile (for Directory & Attendee View)
const getPublicProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const profile = await ExhibitorProfile.findById(id).populate('userId', 'name email');
  if (!profile) {
    return next(new ApiServiceException('Exhibitor profile not found.', 404));
  }

  // Find current booth locations
  const booths = await Booth.find({ exhibitorId: profile.userId._id }).populate('expoId', 'title venue startDate endDate');

  return sendFormattedResponse(res, 200, true, { profile, booths }, 'Exhibitor details retrieved.');
});

// Search & Filter Exhibitors (Public Directory)
const searchExhibitors = asyncHandler(async (req, res) => {
  const { q, category, expoId } = req.query;

  const queryFilter = {};

  if (q) {
    queryFilter.$or = [
      { companyName: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { 'products.name': { $regex: q, $options: 'i' } },
    ];
  }

  if (category && category !== 'ALL') {
    queryFilter.category = category;
  }

  // If filtered by a specific expo, find exhibitors that have allocated booths in that expo
  if (expoId) {
    const allocatedBoothsInExpo = await Booth.find({ expoId, status: 'allocated' }).select('exhibitorId');
    const exhibitorUserIds = allocatedBoothsInExpo.map((b) => b.exhibitorId).filter(Boolean);
    queryFilter.userId = { $in: exhibitorUserIds };
  }

  const exhibitors = await ExhibitorProfile.find(queryFilter)
    .populate('userId', 'name email')
    .sort({ companyName: 1 });

  // Attach allocated booths to each exhibitor for floor plan location
  const userIds = exhibitors.map((e) => e.userId?._id).filter(Boolean);
  let allocatedBooths = [];
  try {
    const boothQuery = Booth.find({
      exhibitorId: { $in: userIds },
      status: 'allocated',
    });
    if (boothQuery && typeof boothQuery.populate === 'function') {
      allocatedBooths = (await boothQuery.populate('expoId', 'title venue city')) || [];
    } else if (Array.isArray(boothQuery)) {
      allocatedBooths = boothQuery;
    }
  } catch (err) {
    allocatedBooths = [];
  }

  const boothMap = new Map();
  for (const b of allocatedBooths) {
    const key = String(b.exhibitorId);
    if (!boothMap.has(key)) boothMap.set(key, []);
    boothMap.get(key).push({
      _id: b._id,
      boothNumber: b.boothNumber,
      category: b.category,
      size: b.size,
      expoId: b.expoId,
    });
  }

  const enrichedExhibitors = exhibitors.map((ex) => {
    if (typeof ex.toObject === 'function') {
      const exObj = ex.toObject();
      exObj.allocatedBooths = boothMap.get(String(ex.userId?._id || ex.userId)) || [];
      return exObj;
    }
    if (boothMap.size === 0) {
      return ex;
    }
    return {
      ...ex,
      allocatedBooths: boothMap.get(String(ex.userId?._id || ex.userId)) || [],
    };
  });

  return sendFormattedResponse(
    res,
    200,
    true,
    { count: enrichedExhibitors.length, exhibitors: enrichedExhibitors },
    'Exhibitors directory loaded.'
  );
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadLogoImage,
  getPublicProfile,
  searchExhibitors,
};
