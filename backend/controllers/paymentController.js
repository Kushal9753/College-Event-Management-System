import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import EventLog from '../models/EventLog.js';

// @desc    Verify and finalize payment
// @route   POST /api/payments/verify/:registrationId
// @access  Private/Admin or Assigned Faculty
export const verifyPayment = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { transactionId, status, paymentMethod } = req.body;

    const registration = await Registration.findById(registrationId).populate('eventId');
    if (!registration) {
      res.status(404);
      throw new Error('Registration not found');
    }

    const event = registration.eventId;
    
    // Authorization: Admin or Assigned Faculty
    const isAdmin = req.user.role === 'admin';
    const isAssignedFaculty = event.assignedFaculty.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isAssignedFaculty) {
      res.status(403);
      throw new Error('Not authorized to verify payment for this event');
    }

    if (status === 'fail') {
        registration.paymentStatus = 'failed';
        await registration.save();
        return res.status(200).json({ success: true, message: 'Payment marked as failed', data: registration });
    }

    // Update Registration Status
    registration.paymentStatus = 'paid';
    registration.transactionId = transactionId || registration.transactionId;
    if (paymentMethod) registration.paymentMethod = paymentMethod;
    await registration.save();

    // Create Payment Record
    const payment = await Payment.create({
      studentName: registration.studentName,
      email: registration.email,
      phone: registration.phone,
      studentId: registration.studentId,
      eventId: event._id,
      amount: registration.amount,
      paymentStatus: 'paid',
      transactionId: registration.transactionId,
      paymentMethod: registration.paymentMethod,
      verifiedBy: req.user._id,
    });

    // Log the action
    await EventLog.create({
      event: event._id,
      action: 'payment_verified',
      performedBy: req.user._id,
      details: `Payment for registration ${registrationId} verified and recorded with status "paid"`,
    });

    res.status(200).json({ success: true, message: 'Payment verified and recorded', data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all event payments
// @route   GET /api/payments/all
// @access  Private/Admin
export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({})
      .populate('studentId', 'name email enrollmentNumber')
      .populate('eventId', 'title registrationFees')
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty's assigned event payments
// @route   GET /api/payments/faculty
// @access  Private/Faculty
export const getFacultyPayments = async (req, res, next) => {
  try {
    // Find events where this faculty is assigned
    const assignedEvents = await Event.find({ assignedFaculty: req.user._id }).select('_id');
    const eventIds = assignedEvents.map(e => e._id);
    
    const payments = await Payment.find({ eventId: { $in: eventIds } })
      .populate('studentId', 'name email enrollmentNumber')
      .populate('eventId', 'title registrationFees')
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payments for a specific event
// @route   GET /api/payments/event/:eventId
// @access  Private/Admin or Assigned Faculty
export const getEventPayments = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Authorization
    const isAdmin = req.user.role === 'admin';
    const isAssignedFaculty = event.assignedFaculty.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isAssignedFaculty) {
        res.status(403);
        throw new Error('Not authorized to view payments for this event');
    }

    const payments = await Payment.find({ eventId })
        .populate('studentId', 'name email enrollmentNumber')
        .populate('verifiedBy', 'name email role')
        .sort({ createdAt: -1 });

    const totalPaidStudentsCount = payments.filter(p => p.paymentStatus === 'paid').length;

    res.status(200).json({ success: true, count: payments.length, totalPaidStudentsCount, data: payments });
  } catch (error) {
    next(error);
  }
};
