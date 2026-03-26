import Availability from '../models/Availability.js';

// @desc    Create availability slot
// @route   POST /api/availability
export const createAvailability = async (req, res, next) => {
  try {
    const { facultyId, date, timeSlot, status } = req.body;

    if (!facultyId || !date || !timeSlot) {
      res.status(400);
      throw new Error('facultyId, date, and timeSlot are required');
    }

    const exists = await Availability.findOne({ facultyId, date, timeSlot });
    if (exists) {
      res.status(409);
      throw new Error(`Availability slot for date ${date} and time ${timeSlot} already exists.`);
    }

    const availability = await Availability.create({
      facultyId,
      date,
      timeSlot,
      status: status || 'available',
    });

    res.status(201).json({ success: true, data: availability });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(500);
    next(error);
  }
};

// @desc    Get availability slots
// @route   GET /api/availability
export const getAvailability = async (req, res, next) => {
  try {
    const { facultyId, date, status } = req.query;

    const query = {};
    if (facultyId) query.facultyId = facultyId;
    if (date) query.date = date;
    if (status) query.status = status;

    const availabilitySlots = await Availability.find(query)
      .populate('facultyId', 'name department email')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json({ success: true, count: availabilitySlots.length, data: availabilitySlots });
  } catch (error) {
    next(error);
  }
};

// @desc    Check conflict for a specific faculty, date, and time slot
// @route   POST /api/availability/check-conflict
export const checkConflict = async (req, res, next) => {
  try {
    const { facultyId, date, timeSlot } = req.body;

    if (!facultyId || !date || !timeSlot) {
      res.status(400);
      throw new Error('facultyId, date, and timeSlot are required for checking conflict');
    }

    const slot = await Availability.findOne({ facultyId, date, timeSlot });

    if (!slot) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'No record found. Faculty has not set availability for this slot.',
      });
    }

    const isConflict = slot.status === 'booked';
    res.status(200).json({
      success: true,
      exists: true,
      isConflict,
      status: slot.status,
      message: isConflict ? 'This slot is already booked.' : 'This slot is available.',
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(500);
    next(error);
  }
};
