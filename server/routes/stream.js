const express = require("express");
const router = express.Router();
const { exec, spawn } = require("child_process");
const path = require("path");

const PLAYER_ARGS = "youtube:player_client=android";
const FORMAT = "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best";
const FFMPEG_PATH = "ffmpeg";
const COOKIES_PATH = path.resolve(__dirname, "../cookies.txt");

// GET /api/stream/url/:videoId - Direkt CDN URL döner
router.get("/url/:videoId", async (req, res) => {
  const { videoId } = req.params;

  exec(
    `yt-dlp --cookies "${COOKIES_PATH}" --extractor-args "${PLAYER_ARGS}" -f "${FORMAT}" --no-playlist --get-url "https://www.youtube.com/watch?v=${videoId}"`,
    (error, stdout, stderr) => {
      console.log("stdout:", stdout);
      console.log("stderr:", stderr);
      console.log("error:", error?.message);

      if (error) {
        return res
          .status(500)
          .json({ error: "Failed to get stream URL", message: stderr });
      }

      const url = stdout.trim().split("\n")[0];

      if (!url) {
        return res.status(500).json({ error: "URL boş döndü" });
      }

      res.json({ url });
    },
  );
});

// GET /api/stream/:videoId - yt-dlp + ffmpeg → mp3 pipe
router.get("/:videoId", (req, res) => {
  const { videoId } = req.params;

  const ytdlp = spawn("yt-dlp", [
    "--cookies", COOKIES_PATH,
    "--extractor-args", PLAYER_ARGS,
    "-f", FORMAT,
    "-o", "-",
    "--quiet",
    "--no-playlist",
    `https://www.youtube.com/watch?v=${videoId}`,
  ]);

  const ffmpeg = spawn(FFMPEG_PATH, [
    "-i", "pipe:0",
    "-vn",
    "-acodec", "libmp3lame",
    "-ab", "128k",
    "-ar", "44100",
    "-write_xing", "1",
    "-id3v2_version", "3",
    "-f", "mp3",
    "pipe:1",
  ]);

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Transfer-Encoding", "chunked");

  ytdlp.stdout.pipe(ffmpeg.stdin);
  ffmpeg.stdout.pipe(res);

  ytdlp.stdout.on("error", () => {});
  ffmpeg.stdin.on("error", () => {});
  ffmpeg.stdout.on("error", () => {});
  res.on("error", () => {});

  ytdlp.stderr.on("data", (data) => {
    console.error("yt-dlp:", data.toString());
  });

  ffmpeg.stderr.on("data", () => {});

  ffmpeg.on("close", (code) => {
    if (code !== 0 && !res.headersSent) {
      res.status(500).json({ error: "Stream başarısız" });
    }
  });

  req.on("close", () => {
    ytdlp.kill();
    ffmpeg.kill();
  });
});

module.exports = router;
