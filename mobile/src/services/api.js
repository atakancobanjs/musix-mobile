// services/api.js
const BASE_URL = "https://musix-mobile.onrender.com/api";

const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const mapItem = (item, baseUrl) => {
  if (!item) return null;

  const id = item.id || Math.random().toString();

  return {
    id,
    title: item.title || "Bilinmeyen Şarkı",
    artist: item.artist || item.author || "Bilinmeyen Sanatçı",
    thumbnail: item.thumbnail || "https://via.placeholder.com/150",
    url: item.url || item.audioUrl || `${baseUrl}/stream/url/${id}`,
    duration: item?.duration || 0,
  };
};

export const getTrending = async (region = "TR") => {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/search/trending?region=${region}`,
    );

    if (!response.ok) {
      throw new Error(`Sunucu Hatası: ${response.status}`);
    }

    const data = await response.json();
    const items = data?.items || data || [];

    if (!Array.isArray(items)) return { items: [] };

    return {
      items: items.map((item) => mapItem(item, BASE_URL)).filter(Boolean),
    };
  } catch (error) {
    console.error("Trending Fetch Hatası:", error.message);
    return { items: [] };
  }
};

export const searchMusic = async (query) => {
  try {
    if (!query) return { items: [] };

    const response = await fetchWithTimeout(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
    );

    if (!response.ok) throw new Error("Arama başarısız");

    const data = await response.json();
    const items = data?.items || data || [];

    if (!Array.isArray(items)) return { items: [] };

    return {
      items: items.map((item) => mapItem(item, BASE_URL)).filter(Boolean),
    };
  } catch (error) {
    console.error("Arama Hatası:", error.message);
    return { items: [] };
  }
};
