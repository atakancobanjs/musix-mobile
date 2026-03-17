const axios = require("axios");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 300 }); // 5 min cache
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

const youtubeService = {
  /**
   * Search for music videos on YouTube
   * @param {string} query
   * @param {number} maxResults
   * @param {string} pageToken
   */
  async search(query, maxResults = 20, pageToken = null) {
    const cacheKey = `search_${query}_${maxResults}_${pageToken}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const params = {
      part: "snippet",
      q: query,
      type: "video",
      videoCategoryId: "10", // Music category
      maxResults,
      key: process.env.YOUTUBE_API_KEY,
    };
    if (pageToken) params.pageToken = pageToken;

    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, { params });

    // Get video durations via videos endpoint
    const videoIds = response.data.items
      .map((item) => item.id.videoId)
      .join(",");
    const detailsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: "contentDetails,statistics",
        id: videoIds,
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    const detailsMap = {};
    detailsResponse.data.items.forEach((item) => {
      detailsMap[item.id] = {
        duration: parseDuration(item.contentDetails.duration),
        viewCount: item.statistics.viewCount,
      };
    });

    const result = {
      items: response.data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        duration: detailsMap[item.id.videoId]?.duration || 0,
        viewCount: detailsMap[item.id.videoId]?.viewCount || "0",
      })),
      nextPageToken: response.data.nextPageToken || null,
      totalResults: response.data.pageInfo.totalResults,
    };

    cache.set(cacheKey, result);
    return result;
  },

  /**
   * Get trending music videos
   */
  async getTrending(regionCode = "TR", maxResults = 20) {
    const cacheKey = `trending_${regionCode}_${maxResults}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: "snippet,contentDetails,statistics",
        chart: "mostPopular",
        videoCategoryId: "10",
        regionCode,
        maxResults,
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    const result = {
      items: response.data.items.map((item) => ({
        id: item.id,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        duration: parseDuration(item.contentDetails.duration),
        viewCount: item.statistics.viewCount,
      })),
    };

    cache.set(cacheKey, result);
    return result;
  },

  /**
   * Get a YouTube playlist's items
   */
  async getPlaylistItems(playlistId, maxResults = 50) {
    const cacheKey = `playlist_${playlistId}_${maxResults}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: "snippet,contentDetails",
        playlistId,
        maxResults,
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    const result = {
      items: response.data.items.map((item) => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        artist: item.snippet.videoOwnerChannelTitle,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.default?.url,
        position: item.snippet.position,
      })),
      nextPageToken: response.data.nextPageToken || null,
    };

    cache.set(cacheKey, result);
    return result;
  },
};

/**
 * Parse ISO 8601 duration (PT4M13S) to seconds
 */
function parseDuration(isoDuration) {
  if (!isoDuration) return 0;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

module.exports = youtubeService;
