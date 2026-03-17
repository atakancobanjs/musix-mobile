const express = require("express");
const router = express.Router();
const youtubeService = require("../services/youtube");

// GET /api/playlist/:playlistId
router.get("/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { maxResults = 50 } = req.query;

    const result = await youtubeService.getPlaylistItems(
      playlistId,
      parseInt(maxResults),
    );
    res.json(result);
  } catch (error) {
    console.error("Playlist error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch playlist", message: error.message });
  }
});

module.exports = router;
