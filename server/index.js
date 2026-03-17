require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const searchRoutes = require("./routes/search.js");
const streamRoutes = require("./routes/stream.js");
const playlistRoutes = require("./routes/playlist");
const lyricsRoutes = require("./routes/lyrics");

const app = express();
const PORT = process.env.PORT || 3000;

// Security & middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Stream linkleri için bazen gerekir
  }),
);
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter); // Sadece API isteklerini limitle

// Routes - ÖNEMLİ: Hepsi /api ile başlıyor
app.use("/api/search", searchRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/lyrics", lyricsRoutes);

// EĞER TRENDING SEARCH İÇİNDEYSE:
// api.js'den gelen /api/trending isteğini karşılamak için:
app.get("/api/trending", (req, res) => {
  // Bu kısmı searchRoutes içine de taşıyabilirsin ama 404'ü çözmek için buraya ekliyorum
  res.redirect("/api/search/trending");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 Handler - Hangi route'un eksik olduğunu konsolda görmek için
app.use((req, res) => {
  console.log(`404 Bulunamadı: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route bulunamadı" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal server error", message: err.message });
});

app.listen(PORT, () => {
  console.log(`🎵 Music API running on http://localhost:${PORT}`);
  console.log(`🚀 Try: http://localhost:${PORT}/api/search?q=tarkan`);
});
