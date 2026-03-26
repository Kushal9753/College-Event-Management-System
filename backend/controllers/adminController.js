import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Event from '../models/Event.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res, next) => {
  try {
    const [studentCount, adminCount, facultyCount, eventStats] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      Faculty.countDocuments(),
      Event.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format event stats into a more usable object
    const events = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    };

    eventStats.forEach((stat) => {
      if (events.hasOwnProperty(stat._id)) {
        events[stat._id] = stat.count;
      }
      events.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          students: studentCount,
          admins: adminCount,
          faculty: facultyCount,
          total: studentCount + adminCount + facultyCount,
        },
        events,
      },
    });
  } catch (error) {
    next(error);
  }
};
