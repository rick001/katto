const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const User = require('../models/User');
const { protect, apiKeyAuth } = require('../middleware/auth');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');

const baseUrl = process.env.BASE_URL;

/**
 * @swagger
 * /api/url/shorten:
 *   post:
 *     summary: Create a shortened URL
 *     tags: [URLs]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalUrl
 *             properties:
 *               originalUrl:
 *                 type: string
 *               customCode:
 *                 type: string
 *               expiresIn:
 *                 type: string
 *                 enum: [1d, 7d, 30d, 90d, 1y]
 *     responses:
 *       201:
 *         description: URL shortened successfully
 *       400:
 *         description: Invalid URL or custom code already exists
 *       401:
 *         description: Unauthorized - Missing or invalid API key
 */
router.post('/shorten', apiKeyAuth, async (req, res) => {
  try {
    const { originalUrl, customCode, expiresIn } = req.body;
    
    // Validate URL
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Get user (authenticated or default)
    let user;
    if (req.user) {
      user = req.user;
    } else {
      // For non-authenticated requests, use the default user
      user = await User.getDefaultUser();
    }

    // Generate short code
    const shortCode = customCode || nanoid(6);

    // Check if custom code already exists
    const existingUrl = await Url.findOne({ shortCode });
    if (existingUrl) {
      return res.status(400).json({ error: 'Custom code already exists' });
    }

    // Calculate expiration date
    let expiresAt;
    if (req.user && expiresIn) {
      const [value, unit] = expiresIn.match(/(\d+)([dmy])/).slice(1);
      const multiplier = { d: 1, m: 30, y: 365 }[unit];
      expiresAt = new Date(Date.now() + value * multiplier * 24 * 60 * 60 * 1000);
    } else {
      // Default 30 days expiration for non-authenticated users
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Create URL
    const url = await Url.create({
      originalUrl,
      shortCode,
      user: user._id,
      expiresAt
    });

    res.status(201).json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      expiresAt: url.expiresAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/url/{code}:
 *   get:
 *     summary: Get URL information
 *     tags: [URL]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code
 *     responses:
 *       200:
 *         description: URL information
 *       404:
 *         description: URL not found
 */
router.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if URL has expired
    if (url.expiresAt < new Date()) {
      return res.status(410).json({ error: 'This URL has expired' });
    }

    // Increment click count
    url.clicks += 1;
    await url.save();

    return res.json({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      clicks: url.clicks,
      expiresAt: url.expiresAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
