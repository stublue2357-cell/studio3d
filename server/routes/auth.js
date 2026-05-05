const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authMiddleware, ownerOnly } = require('../middleware/adminAuth');
const { sendPasswordResetEmail } = require('../utils/emailService');

// --- 1. REGISTER API ---
router.post('/register', async (req, res) => {
  // --- MOCK BYPASS ---
  if (global.isSimulationMode) {
      console.log("SIM_MODE: REGISTER_BYPASS");
      return res.status(201).json({ msg: "SUCCESS // MOCK_SYNTHESIS" });
  }
  try {
    const { name, email, password, adminSecret } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "IDENTITY_EXISTS // ACCESS_DENIED" });

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ADMIN LOGIC: Secret Key Check
    const SECRET_KEY = "STUDIO3D_ADMIN_786";
    const SUB_OWNER_KEY = "STUDIO3D_SUB_OWNER_99"; 
    const OWNER_KEY = "STUDIO3D_OWNER_MASTER";
    const DEVELOPER_EMAIL = "haseebsaleem312@gmail.com";
    
    let userRole = 'user';
    if (email === DEVELOPER_EMAIL) {
        userRole = 'developer';
    } else if (adminSecret === OWNER_KEY) {
        userRole = 'owner';
    } else if (adminSecret === SUB_OWNER_KEY) {
        userRole = 'sub-owner';
    } else if (adminSecret === SECRET_KEY) {
        userRole = 'admin';
    }

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole
    });

    await user.save();
    res.status(201).json({ msg: `SUCCESS // SYNTHESIZED_AS_${userRole.toUpperCase()}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "SERVER_ERROR // SYNTHESIS_FAILED" });
  }
});

// --- 2. LOGIN API ---
router.post('/login', async (req, res) => {
  // --- MOCK BYPASS ---
  if (global.isSimulationMode) {
      console.log("SIM_MODE: LOGIN_BYPASS_FOR_USER:", req.body.email);
      const isDeveloper = req.body.email === "haseebsaleem312@gmail.com";
      const finalRole = isDeveloper ? 'developer' : 'owner';
      const mockToken = jwt.sign({ id: "dev_id_786", role: finalRole }, process.env.JWT_SECRET || "Secure_Studio_Fallback_Key", { expiresIn: '24h' });
      return res.json({
          token: mockToken,
          user: { id: "dev_id_786", name: isDeveloper ? "HASEEB_DEVELOPER" : "STUDIO_PILOT", email: req.body.email, role: finalRole }
      });
  }
  try {
    const { email, password } = req.body;
    
    // Check if user exists (Case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "INVALID_CREDENTIALS // NODE_NOT_FOUND" });

    // Password Match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "INVALID_CREDENTIALS // CIPHER_MISMATCH" });

    // 👉 HARDCODE ENFORCEMENT: Ensure the developer email always has the role in the token
    const finalRole = (user.email === "haseebsaleem312@gmail.com") ? 'developer' : user.role;

    // Generate JWT Token with Role Payload (Added Fallback for Secret)
    const token = jwt.sign(
      { id: user._id, role: finalRole }, 
      process.env.JWT_SECRET || "Secure_Studio_Fallback_Key", 
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: finalRole }
    });
  } catch (err) {
    console.error("LOGIN_CRITICAL_ERROR:", err.message);
    res.status(500).json({ 
        msg: "SERVER_ERROR // AUTH_FAILED", 
        debug: err.message, // This will help us see the EXACT error on the frontend
        stack: "HANDSHAKE_FAILURE"
    });
  }
});

const roleLevels = {
    'user': 1,
    'admin': 2,
    'owner': 3,
    'sub-owner': 4,
    'developer': 5
};

// --- 3. ROLE MANAGEMENT ---
router.patch('/manage-role', authMiddleware, async (req, res) => {
    try {
        const { targetUserId, newRole } = req.body;
        const requesterRole = req.user.role;

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ msg: "TARGET_NOT_FOUND" });

        const requesterLevel = roleLevels[requesterRole] || 0;
        const targetCurrentLevel = roleLevels[targetUser.role] || 0;
        const newRoleLevel = roleLevels[newRole] || 0;

        // Requester cannot modify a user with an equal or higher rank
        if (targetCurrentLevel >= requesterLevel) {
            return res.status(403).json({ msg: "ACCESS_DENIED // CANNOT_MODIFY_UPPER_OR_EQUAL_LEVEL" });
        }

        // Requester cannot promote someone to an equal or higher rank than themselves
        if (newRoleLevel >= requesterLevel) {
            return res.status(403).json({ msg: "ACCESS_DENIED // CANNOT_PROMOTE_TO_UPPER_OR_EQUAL_LEVEL" });
        }

        await User.findByIdAndUpdate(targetUserId, { role: newRole });
        return res.json({ msg: `SUCCESS // NODE_RECONFIGURED_TO_${newRole.toUpperCase()}` });

    } catch (err) {
        res.status(500).json({ msg: "SERVER_ERROR // RECONFIGURATION_FAILED" });
    }
});

// --- 4. GET ALL USERS (Developer & Sub-Owner only) ---
router.get('/users', authMiddleware, ownerOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: "SERVER_ERROR // DATA_RETRIVAL_FAILED" });
    }
});

// --- 5. UPDATE PROFILE (All authed users) ---
router.patch('/update-profile', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ msg: "IDENTITY_NOT_FOUND" });

        if (name) user.name = name;
        await user.save();

        res.json({ msg: "SUCCESS // IDENTITY_UPDATED", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ msg: "SERVER_ERROR // UPDATE_FAILED" });
    }
});

// --- 6. CHANGE PASSWORD (All authed users) ---
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: "IDENTITY_NOT_FOUND" });

        // Verify Current Password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: "CURRENT_PASSWORD_INCORRECT // UNAUTHORIZED" });

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ msg: "SUCCESS // CIPHER_RECONFIGURED" });
    } catch (err) {
        res.status(500).json({ msg: "SERVER_ERROR // RECONFIGURATION_FAILED" });
    }
});

// --- 7. FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) return res.status(404).json({ msg: "IDENTITY_NOT_FOUND" });

        // Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Hash and set to user field
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Create reset URL
        const resetUrl = `${req.headers.origin}/reset-password/${resetToken}`;
        
        await sendPasswordResetEmail(user.email, user.name, resetUrl);

        res.json({ msg: "SUCCESS // RECOVERY_TRANSMISSION_SENT" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "SERVER_ERROR // RECOVERY_FAILED" });
    }
});

// --- 8. RESET PASSWORD ---
router.post('/reset-password/:token', async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ msg: "INVALID_OR_EXPIRED_TOKEN" });

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ msg: "SUCCESS // CIPHER_UPDATED" });
    } catch (err) {
        res.status(500).json({ msg: "SERVER_ERROR // RESET_FAILED" });
    }
});

// --- 9. GOOGLE LOGIN ---
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email } = ticket.getPayload();

        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Create new user if doesn't exist
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), salt);
            
            user = new User({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'user'
            });
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "Secure_Studio_Fallback_Key",
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (err) {
        console.error("GOOGLE_LOGIN_ERROR:", err);
        res.status(500).json({ msg: "SERVER_ERROR // GOOGLE_AUTH_FAILED" });
    }
});

module.exports = router;