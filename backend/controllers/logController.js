import EventLog from '../models/EventLog.js';
import Event from '../models/Event.js';

// @desc    Get logs for a specific event
// @route   GET /api/events/:id/logs
// @access  Private (Admin or Assigned Faculty)
export const getEventLogs = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Role check: admin gets access. Faculty gets access only if they created it or are assigned to it.
    if (req.user.role === 'faculty') {
      const isCreator = event.createdBy.toString() === req.user._id.toString();
      const isAssigned = event.assignedFaculty.some((facultyId) => facultyId.toString() === req.user._id.toString());
      if (!isCreator && !isAssigned) {
        res.status(403);
        throw new Error('Not authorized to view logs for this event');
      }
    } else if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view logs');
    }

    const logs = await EventLog.find({ event: req.params.id })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};
