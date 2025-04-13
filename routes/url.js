const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const { nanoid } = require('nanoid/non-secure');
const validUrl = require('valid-url');
const { protect, apiKeyAuth } = require('../middleware/auth');

const baseUrl = process.env.BASE_URL;

/**
 * @swagger
 * /api/url/shorten:
 *   post:
 *     summary: Create a shortened URL
 *     tags: [URL]
 *     security:
 *       - bearerAuth: []
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
 *                 description: The original URL to be shortened
 *               customCode:
 *                 type: string
 *                 description: Optional custom short code
 *               expiresIn:
 *                 type: string
 *                 description: Optional expiration time (e.g., '1d', '1w', '1m', '1y')
 *     responses:
 *       200:
 *         description: URL shortened successfully
 *       400:
 *         description: Invalid URL or custom code already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/shorten', [protect, apiKeyAuth], async (req, res) => {
  const { originalUrl, customCode, expiresIn } = req.body;

  // Ensure URL has http:// or https://
  const urlToShorten = originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`;

  if (!validUrl.isUri(urlToShorten)) {
    return res.status(400).json({ error: 'Invalid original URL' });
  }

  const shortCode = customCode || nanoid(8);

  try {
    let url = await Url.findOne({ shortCode });

    if (url && customCode) {
      return res.status(400).json({ error: 'Custom code already exists' });
    }

    // Calculate expiration date if provided
    let expiresAt;
    if (expiresIn) {
      const now = new Date();
      const [value, unit] = expiresIn.match(/(\d+)([dwmy])/).slice(1);
      const multiplier = {
        d: 24 * 60 * 60 * 1000,    // days
        w: 7 * 24 * 60 * 60 * 1000, // weeks
        m: 30 * 24 * 60 * 60 * 1000, // months (approximate)
        y: 365 * 24 * 60 * 60 * 1000 // years
      }[unit];
      
      expiresAt = new Date(now.getTime() + (value * multiplier));
    }

    if (!url) {
      url = new Url({
        shortCode,
        originalUrl: urlToShorten,
        user: req.user._id,
        expiresAt
      });
      await url.save();
    }

    return res.json({ 
      shortCode,
      originalUrl: urlToShorten,
      shortUrl: `${baseUrl}/${shortCode}`,
      expiresAt: url.expiresAt
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).send('Server error');
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
