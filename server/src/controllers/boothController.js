const Booth = require('../models/Booth');
const Expo = require('../models/Expo');
const User = require('../models/User');
const ExhibitorApplication = require('../models/ExhibitorApplication');
const Notification = require('../models/Notification');
const { notify } = require('../services/notificationService');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Helper to notify socket clients of booth changes
const emitBoothLiveUpdate = (req, expoId, boothData, action) => {
  const io = req.app.get('socketio');
  if (io) {
    io.to(`expo:${expoId}`).emit('booth:updated', {
      action,
      booth: boothData,
    });
    console.log(`[Socket Broadcast] Live booth update emitted for expo: ${expoId}`);
  }
};

// Get all booths for a specific Expo
const getBoothsByExpo = asyncHandler(async (req, res, next) => {
  const { expoId } = req.params;

  const expo = await Expo.findById(expoId);
  if (!expo) {
    return next(new ApiServiceException('Exhibition not found.', 404));
  }

  const booths = await Booth.find({ expoId })
    .populate('exhibitorId', 'name email phone')
    .sort({ 'position.row': 1, 'position.col': 1, boothNumber: 1 });

  return sendFormattedResponse(res, 200, true, { booths }, 'Booths retrieved successfully.');
});

// Create a single Booth (Admin)
const createBooth = asyncHandler(async (req, res, next) => {
  const { expoId, boothNumber, size, price, category, position, notes } = req.body;

  // Check duplicate booth number within expo
  const existing = await Booth.findOne({ expoId, boothNumber: boothNumber.toUpperCase() });
  if (existing) {
    return next(
      new ApiServiceException(
        `Booth number "${boothNumber.toUpperCase()}" already exists in this exhibition.`,
        400
      )
    );
  }

  const newBooth = await Booth.create({
    expoId,
    boothNumber: boothNumber.toUpperCase(),
    size: size || '10x10',
    price,
    category: category || 'Standard',
    position: position || { row: 1, col: 1 },
    notes: notes || '',
    status: 'available',
  });

  emitBoothLiveUpdate(req, expoId, newBooth, 'created');

  return sendFormattedResponse(res, 201, true, { booth: newBooth }, 'Booth created successfully.');
});

// Bulk Generate Matrix of Booths (Admin)
const bulkGenerateBooths = asyncHandler(async (req, res, next) => {
  const { expoId, rows, cols, basePrice = 500, defaultSize = '10x10', defaultCategory = 'Standard' } = req.body;

  const expo = await Expo.findById(expoId);
  if (!expo) {
    return next(new ApiServiceException('Exhibition not found.', 404));
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const newBoothsToInsert = [];

  for (let r = 1; r <= rows; r++) {
    const rowLetter = alphabet[r - 1] || `R${r}`;
    for (let c = 1; c <= cols; c++) {
      const colNumber = c < 10 ? `0${c}` : `${c}`;
      const boothNumber = `${rowLetter}-${colNumber}`;

      // Detect Corner booths automatically (first/last col)
      let calculatedCategory = defaultCategory;
      if (c === 1 || c === cols) {
        calculatedCategory = 'Corner';
      }

      newBoothsToInsert.push({
        expoId,
        boothNumber,
        size: defaultSize,
        price: calculatedCategory === 'Corner' ? basePrice * 1.25 : basePrice,
        category: calculatedCategory,
        position: { row: r, col: c },
        status: 'available',
      });
    }
  }

  // Insert while ignoring duplicate booth numbers if any exist
  let createdCount = 0;
  for (const boothData of newBoothsToInsert) {
    const exists = await Booth.findOne({ expoId, boothNumber: boothData.boothNumber });
    if (!exists) {
      await Booth.create(boothData);
      createdCount++;
    }
  }

  const allBooths = await Booth.find({ expoId }).sort({ 'position.row': 1, 'position.col': 1 });

  emitBoothLiveUpdate(req, expoId, null, 'bulk-generated');

  return sendFormattedResponse(
    res,
    201,
    true,
    { createdCount, booths: allBooths },
    `Generated ${createdCount} booths for the exhibition layout.`
  );
});

// Update Booth (Admin)
const updateBooth = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booth = await Booth.findById(id);
  if (!booth) {
    return next(new ApiServiceException('Booth not found.', 404));
  }

  // Prevent changing boothNumber to a conflicting one
  if (req.body.boothNumber && req.body.boothNumber.toUpperCase() !== booth.boothNumber) {
    const conflict = await Booth.findOne({
      expoId: booth.expoId,
      boothNumber: req.body.boothNumber.toUpperCase(),
      _id: { $ne: id },
    });
    if (conflict) {
      return next(new ApiServiceException('Another booth with this number already exists.', 400));
    }
    req.body.boothNumber = req.body.boothNumber.toUpperCase();
  }

  const updatedBooth = await Booth.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate('exhibitorId', 'name email');

  emitBoothLiveUpdate(req, updatedBooth.expoId, updatedBooth, 'updated');

  return sendFormattedResponse(res, 200, true, { booth: updatedBooth }, 'Booth details updated.');
});

// Delete Booth (Admin)
const deleteBooth = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booth = await Booth.findById(id);
  if (!booth) {
    return next(new ApiServiceException('Booth not found.', 404));
  }

  if (booth.status === 'allocated' && !req.query.force) {
    return next(
      new ApiServiceException(
        'Cannot delete an allocated booth. Release it first or provide ?force=true.',
        400
      )
    );
  }

  const expoId = booth.expoId;
  await Booth.findByIdAndDelete(id);

  emitBoothLiveUpdate(req, expoId, { _id: id }, 'deleted');

  return sendFormattedResponse(res, 200, true, null, 'Booth removed from layout.');
});

// Allocate Booth to Exhibitor (Admin)
const allocateBooth = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { exhibitorId, notes } = req.body;

  if (!exhibitorId) {
    return next(new ApiServiceException('Exhibitor ID is required to allocate a booth.', 400));
  }

  const exhibitor = await User.findById(exhibitorId);
  if (!exhibitor) {
    return next(new ApiServiceException('Exhibitor account not found.', 404));
  }

  const updatedBooth = await Booth.findByIdAndUpdate(
    id,
    {
      status: 'allocated',
      exhibitorId,
      allocatedAt: new Date(),
      ...(notes && { notes }),
    },
    { new: true }
  ).populate('exhibitorId', 'name email phone');

  if (!updatedBooth) {
    return next(new ApiServiceException('Booth not found.', 404));
  }

  emitBoothLiveUpdate(req, updatedBooth.expoId, updatedBooth, 'allocated');

  // Dispatch in-app notification to the allocated exhibitor
  notify(exhibitorId, {
    type: 'booth_allocated',
    title: 'Exhibition Stall Officially Allocated',
    message: `Booth ${updatedBooth.boothNumber} has been allocated to your organization. Review stall specifications in your portal.`,
    link: `/exhibitor/booths?expoId=${updatedBooth.expoId}`,
  }).catch(() => {});

  return sendFormattedResponse(
    res,
    200,
    true,
    { booth: updatedBooth },
    `Booth ${updatedBooth.boothNumber} allocated to ${exhibitor.name}.`
  );
});

// Release Booth back to Available (Admin)
const releaseBooth = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const updatedBooth = await Booth.findByIdAndUpdate(
    id,
    {
      status: 'available',
      exhibitorId: null,
      allocatedAt: null,
    },
    { new: true }
  );

  if (!updatedBooth) {
    return next(new ApiServiceException('Booth not found.', 404));
  }

  emitBoothLiveUpdate(req, updatedBooth.expoId, updatedBooth, 'released');

  return sendFormattedResponse(
    res,
    200,
    true,
    { booth: updatedBooth },
    `Booth ${updatedBooth.boothNumber} released and is now available.`
  );
});

// Exhibitor Self-Reservation (Atomic to prevent double booking)
const reserveBoothByExhibitor = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const targetBooth = await Booth.findById(id).populate('expoId', 'title');
  if (!targetBooth) {
    return next(new ApiServiceException('Target booth not found.', 404));
  }

  // 1. Verify that exhibitor has an APPROVED application for this Expo
  const approvedApp = await ExhibitorApplication.findOne({
    exhibitorId: req.user.id,
    expoId: targetBooth.expoId._id,
    status: 'approved',
  });

  if (!approvedApp) {
    return next(
      new ApiServiceException(
        'You must have an APPROVED application for this exhibition before you can select and reserve a booth.',
        403
      )
    );
  }

  // 2. ATOMIC update: Only update if status is currently 'available'
  const reservedBooth = await Booth.findOneAndUpdate(
    { _id: id, status: 'available' },
    {
      status: 'allocated',
      exhibitorId: req.user.id,
      allocatedAt: new Date(),
      notes: 'Reserved directly by verified exhibitor',
    },
    { new: true }
  ).populate('exhibitorId', 'name email');

  // If null, someone else just booked it!
  if (!reservedBooth) {
    return next(
      new ApiServiceException(
        `Booth ${targetBooth.boothNumber} is no longer available. It may have just been reserved by another exhibitor. Please select another stall.`,
        400
      )
    );
  }

  // Live Socket broadcast
  emitBoothLiveUpdate(req, reservedBooth.expoId, reservedBooth, 'allocated');

  // Create notification
  await Notification.create({
    userId: req.user.id,
    type: 'booth_allocated',
    title: 'Booth Reservation Confirmed!',
    message: `You have successfully reserved Booth ${reservedBooth.boothNumber} for "${targetBooth.expoId?.title}".`,
    link: `/exhibitor/booths?expoId=${reservedBooth.expoId}`,
  });

  return sendFormattedResponse(
    res,
    200,
    true,
    { booth: reservedBooth },
    `Congratulations! Booth ${reservedBooth.boothNumber} has been secured for your company.`
  );
});

// Get Single Booth Details (with analytics view event)
const getBoothById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booth = await Booth.findById(id)
    .populate('exhibitorId', 'name email phone')
    .populate('expoId', 'title venue city startDate endDate');

  if (!booth) {
    return next(new ApiServiceException('Booth not found.', 404));
  }

  // Safely record analytics event
  const { logEvent } = require('../services/analyticsService');
  logEvent({
    type: 'booth_view',
    expoId: booth.expoId?._id || booth.expoId,
    refId: booth._id,
    refModel: 'Booth',
    userId: req.user?.id || null,
    metadata: { boothNumber: booth.boothNumber, category: booth.category },
  }).catch(() => {});

  return sendFormattedResponse(res, 200, true, { booth }, 'Booth details retrieved.');
});

// Update Exhibitor Booth Details (Showcased Products & Staff Information)
const updateBoothDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { productsShowcased, staff, notes } = req.body;

  const booth = await Booth.findById(id);
  if (!booth) {
    return next(new ApiServiceException('Booth not found.', 404));
  }

  // Authorization: must be admin OR the assigned exhibitor
  if (req.user.role !== 'admin' && String(booth.exhibitorId) !== String(req.user.id)) {
    return next(
      new ApiServiceException('You do not have permission to manage details for this booth.', 403)
    );
  }

  if (Array.isArray(productsShowcased)) {
    booth.productsShowcased = productsShowcased.map((p) => String(p).trim()).filter(Boolean);
  }
  if (Array.isArray(staff)) {
    booth.staff = staff;
  }
  if (notes !== undefined) {
    booth.notes = notes;
  }

  await booth.save();

  const updatedBooth = await Booth.findById(id)
    .populate('exhibitorId', 'name email phone')
    .populate('expoId', 'title venue city');

  emitBoothLiveUpdate(req, updatedBooth.expoId?._id || updatedBooth.expoId, updatedBooth, 'updated');

  return sendFormattedResponse(
    res,
    200,
    true,
    { booth: updatedBooth },
    'Booth showcase and staff details updated successfully.'
  );
});

module.exports = {
  getBoothsByExpo,
  getBoothById,
  createBooth,
  bulkGenerateBooths,
  updateBooth,
  deleteBooth,
  allocateBooth,
  releaseBooth,
  reserveBoothByExhibitor,
  updateBoothDetails,
};
