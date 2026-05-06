const Activity = require('../models/Activity');
const mockStore = require('./mockStore');

/**
 * LOG USER ACTIVITY
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Short description of the action (e.g., 'LOGIN', 'DESIGN_SAVED')
 * @param {string} details - Detailed metadata or message
 */
const logActivity = async (userId, action, details) => {
    try {
        if (global.isSimulationMode) {
            console.log(`[SIM_LOG] USER:${userId} | ACTION:${action} | DETAILS:${details}`);
            mockStore.addActivity(userId, action, details);
            return;
        }

        const newActivity = new Activity({
            user: userId,
            action,
            details
        });

        await newActivity.save();
    } catch (err) {
        console.error("ACTIVITY_LOGGING_FAILED:", err.message);
    }
};

module.exports = { logActivity };
