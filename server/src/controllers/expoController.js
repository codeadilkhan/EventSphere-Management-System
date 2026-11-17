const Expo = require('../models/Expo');
const Booth = require('../models/Booth');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Create new Expo (Admin Only)
const createExpo = asyncHandler(async (req, res, next) => {
  const { title, description, theme, startDate, endDate, location, status, bannerImage } = req.body;

  const newExpo = await Expo.create({
    title,
    description,
    theme,
    startDate,
    endDate,
    location,
    status: status || 'draft',
    bannerImage: bannerImage || '',
    createdBy: req.user.id,
  });

  return sendFormattedResponse(res, 201, true, { expo: newExpo }, 'Exhibition created successfully.');
});

// Get all Expos (Public sees published; Admin can see all with filter & search)
const getAllExpos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, status, q, sort = 'startDate' } = req.query;

  const queryFilter = {};

  // Restrict non-admins to published expos
  if (!req.user || req.user.role !== 'admin') {
    queryFilter.status = 'published';
  } else if (status) {
    queryFilter.status = status;
  }

  // Keyword search
  if (q) {
    queryFilter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { theme: { $regex: q, $options: 'i' } },
      { 'location.city': { $regex: q, $options: 'i' } },
      { 'location.venue': { $regex: q, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skipCount = (pageNum - 1) * limitNum;

  const totalExpos = await Expo.countDocuments(queryFilter);
  const exposList = await Expo.find(queryFilter)
    .populate('createdBy', 'name email')
    .sort(sort === 'latest' ? { createdAt: -1 } : { startDate: 1 })
    .skip(skipCount)
    .limit(limitNum)
    .lean();

  // Attach quick booth stats for each expo
  const exposWithStats = await Promise.all(
    exposList.map(async (expo) => {
      const [totalBooths, bookedBooths] = await Promise.all([
        Booth.countDocuments({ expoId: expo._id }),
        Booth.countDocuments({ expoId: expo._id, status: { $in: ['reserved', 'allocated'] } }),
      ]);
      return {
        ...expo,
        boothsTotal: totalBooths,
        boothsBooked: bookedBooths,
        boothsAvailable: totalBooths - bookedBooths,
      };
    })
  );

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      expos: exposWithStats,
      pagination: {
        total: totalExpos,
        page: pageNum,
        pages: Math.ceil(totalExpos / limitNum),
        limit: limitNum,
      },
    },
    'Exhibitions retrieved successfully.'
  );
});

// Get single Expo by ID
const getExpoById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const expo = await Expo.findById(id).populate('createdBy', 'name email');
  if (!expo) {
    return next(new ApiServiceException('Exhibition not found with the provided ID.', 404));
  }

  // Non-admins cannot see draft unless authorized
  if (expo.status === 'draft' && (!req.user || req.user.role !== 'admin')) {
    return next(new ApiServiceException('This exhibition is currently in draft mode.', 403));
  }

  // Fetch all booths for this expo
  const booths = await Booth.find({ expoId: id })
    .populate('exhibitorId', 'name email')
    .sort({ 'position.row': 1, 'position.col': 1, boothNumber: 1 });

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      expo,
      booths,
      stats: {
        total: booths.length,
        available: booths.filter((b) => b.status === 'available').length,
        reserved: booths.filter((b) => b.status === 'reserved').length,
        allocated: booths.filter((b) => b.status === 'allocated').length,
      },
    },
    'Exhibition details retrieved.'
  );
});

// Update Expo (Admin Only)
const updateExpo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const updatedExpo = await Expo.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedExpo) {
    return next(new ApiServiceException('Exhibition not found.', 404));
  }

  // Socket notification
  const io = req.app.get('socketio');
  if (io) {
    io.to(`expo:${updatedExpo._id}`).emit('expo:updated', { expo: updatedExpo });
    io.emit('expo:list:updated', { expo: updatedExpo });
  }

  return sendFormattedResponse(res, 200, true, { expo: updatedExpo }, 'Exhibition updated successfully.');
});

// Delete Expo (Admin Only)
const deleteExpo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const expo = await Expo.findById(id);
  if (!expo) {
    return next(new ApiServiceException('Exhibition not found.', 404));
  }

  // Delete associated booths
  await Booth.deleteMany({ expoId: id });
  await Expo.findByIdAndDelete(id);

  return sendFormattedResponse(res, 200, true, null, 'Exhibition and associated booths deleted.');
});

// Upload Banner Image (Admin Only)
const uploadBannerImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiServiceException('No image file was received.', 400));
  }

  const relativePath = `/uploads/${req.file.filename}`;
  return sendFormattedResponse(
    res,
    200,
    true,
    { imagePath: relativePath },
    'Banner image uploaded successfully.'
  );
});

module.exports = {
  createExpo,
  getAllExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
  uploadBannerImage,
};
