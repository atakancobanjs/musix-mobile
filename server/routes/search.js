const express = require("express");
const router = express.Router();
const youtubeService = require("../services/youtube");

// GET /api/search?q=query&maxResults=20&pageToken=xxx
router.get("/", async (req, res) => {
  try {
    const { q, maxResults = 20, pageToken } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await youtubeService.search(
      q.trim(),
      parseInt(maxResults),
      pageToken,
    );
    res.json(results);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Search failed", message: error.message });
  }
});

// GET /api/search/trending?regionCode=TR
router.get("/trending", async (req, res) => {
  try {
    const { regionCode = "TR", maxResults = 20 } = req.query;
    const results = await youtubeService.getTrending(
      regionCode,
      parseInt(maxResults),
    );
    res.json(results);
  } catch (error) {
    console.error("Trending error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch trending", message: error.message });
  }
});

module.exports = router;
