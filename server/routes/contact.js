const router = require('express').Router();
const { logActivity } = require('../utils/activityLogger');

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ msg: "INCOMPLETE_SIGNAL // ALL_FIELDS_REQUIRED" });
    }

    console.log(`CONTACT_MESSAGE_RECEIVED from ${name} (${email}): ${message}`);
    
    // Log activity if user is logged in (optional)
    // We can't use authMiddleware here if we want guest contact
    
    res.status(200).json({ msg: "TRANSMISSION_SUCCESS // SIGNAL_RECEIVED" });
});

module.exports = router;
