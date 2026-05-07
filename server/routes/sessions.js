const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const mockStore = require('../utils/mockStore');

// Middleware to verify token and get user ID
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Secure_Studio_Fallback_Key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const { logActivity } = require('../utils/activityLogger');

// @route   POST /api/sessions
// @desc    Save or update a session
router.post('/', auth, async (req, res) => {
  if (global.isSimulationMode) {
    const savedSession = mockStore.saveSession(req.body, req.user.id);
    await logActivity(req.user.id, "DESIGN_SAVED", `Synthesized design protocol: ${req.body.name || "Unnamed Design"}`);
    return res.json(savedSession);
  }
  try {
    const { sessionId, name, canvasJSON, fabricColor, baseType, aiTexture, chatHistory, thumbnail } = req.body;

    // SANITIZE SESSION ID: Prevent CastError if sessionId is invalid
    const isValidSessionId = sessionId && typeof sessionId === 'string' && sessionId.length === 24 && /^[0-9a-fA-F]{24}$/.test(sessionId);

    if (isValidSessionId) {
      const session = await Session.findOneAndUpdate(
        { _id: sessionId, userId: req.user.id },
        { name, canvasJSON, fabricColor, baseType, aiTexture, chatHistory, thumbnail },
        { new: true }
      );
      if (session) {
        await logActivity(req.user.id, "DESIGN_UPDATED", `Modified existing design protocol: ${name || "Unnamed Design"}`);
        return res.json(session);
      }
    }

    const newSession = new Session({
      userId: req.user.id,
      name,
      canvasJSON,
      fabricColor,
      baseType,
      aiTexture,
      chatHistory,
      thumbnail
    });

    const savedSession = await newSession.save();
    await logActivity(req.user.id, "DESIGN_SAVED", `Synthesized new ${baseType || "apparel"} design: ${name || "Unnamed Protocol"}`);
    res.json(savedSession);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sessions
// @desc    Get all sessions for a user
router.get('/', auth, async (req, res) => {
  if (global.isSimulationMode) {
    console.log("SIM_MODE: SESSION_FETCH_BYPASS");
    return res.json(mockStore.getSessions(req.user.id));
  }
  try {
    const sessions = await Session.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific session
router.get('/:id', auth, async (req, res) => {
  if (global.isSimulationMode) {
    const session = mockStore.getSessionById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    return res.json(session);
  }
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a session
router.delete('/:id', auth, async (req, res) => {
  if (global.isSimulationMode) {
    mockStore.deleteSession(req.params.id, req.user.id);
    return res.json({ message: 'Session deleted' });
  }
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
