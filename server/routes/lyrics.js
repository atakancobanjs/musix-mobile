const express = require("express");
const router = express.Router();
const axios = require("axios");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// GET /api/lyrics?artist=Artist&title=Song+Title
router.get("/", async (req, res) => {
  try {
    const { artist, title } = req.query;

    if (!artist || !title) {
      return res
        .status(400)
        .json({ error: '"artist" and "title" query params are required' });
    }

    const cacheKey = `lyrics_${artist}_${title}`
      .toLowerCase()
      .replace(/\s+/g, "_");
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // lyrics.ovh is a free, no-auth-required lyrics API
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
      { timeout: 5000 },
    );

    const result = {
      artist,
      title,
      lyrics: response.data.lyrics,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Lyrics not found" });
    }
    console.error("Lyrics error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch lyrics", message: error.message });
  }
});

module.exports = router;
