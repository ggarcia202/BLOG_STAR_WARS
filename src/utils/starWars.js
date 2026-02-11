export const ENTITY_LABELS = {
  people: "Personajes",
  planets: "Planetas"
};

export const ENTITY_IMAGE_PATH = {
  people: "people",
  planets: "planets"
};

export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:3001").replace(/\/$/, "");

export const getEntityImage = (type, id) => {
  const imagePath = ENTITY_IMAGE_PATH[type];
  return `https://starwars-visualguide.com/assets/img/${imagePath}/${id}.jpg`;
};

export const getEntityListUrl = (type) => {
  return `${API_BASE_URL}/${type}`;
};

export const getEntityDetailUrl = (type, id) => {
  return `${API_BASE_URL}/${type}/${id}`;
};

export const getFavoritesUrl = () => `${API_BASE_URL}/users/favorites`;

const FAVORITE_ENDPOINT_BY_TYPE = {
  people: "people",
  planets: "planet"
};

export const getFavoriteUrl = (type, id) => {
  const endpointType = FAVORITE_ENDPOINT_BY_TYPE[type];
  if (!endpointType) throw new Error("Tipo de favorito no soportado.");
  return `${API_BASE_URL}/favorite/${endpointType}/${id}`;
};

export const normalizeEntity = (type, item) => ({
  uid: String(item.id),
  name: item.name,
  type,
  details: item
});

export const normalizeFavorite = (favorite) => {
  const type = favorite.type === "planet" ? "planets" : "people";
  const entity = favorite.item || {};
  return {
    uid: String(entity.id),
    name: entity.name || "Sin nombre",
    type
  };
};

const wikipediaImageCache = new Map();

const getWikipediaTitles = (name, type) => {
  if (!name) return [];

  const cleanedName = name.trim();
  const titles = [cleanedName, `${cleanedName} (Star Wars)`];

  if (type === "planets") titles.push(`${cleanedName} (planet)`);
  if (type === "vehicles") titles.push(`${cleanedName} (vehicle)`);
  if (type === "people") titles.push(`${cleanedName} (character)`);

  return [...new Set(titles)];
};

const getWikipediaThumbnail = async (title) => {
  const endpoint = "https://en.wikipedia.org/w/api.php";
  const url = `${endpoint}?action=query&origin=*&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=900&titles=${encodeURIComponent(title)}`;
  const response = await fetch(url);
  if (!response.ok) return "";

  const data = await response.json();
  const pages = data?.query?.pages || {};
  const page = Object.values(pages)[0];
  return page?.thumbnail?.source || "";
};

export const getInternetImageByName = async (name, type) => {
  const cacheKey = `${type}-${(name || "").toLowerCase()}`;
  if (wikipediaImageCache.has(cacheKey)) {
    return wikipediaImageCache.get(cacheKey);
  }

  const imagePromise = (async () => {
    const titles = getWikipediaTitles(name, type);
    for (const title of titles) {
      try {
        const thumbnail = await getWikipediaThumbnail(title);
        if (thumbnail) return thumbnail;
      } catch {
        // Ignore and keep trying alternative titles.
      }
    }
    return "";
  })();

  wikipediaImageCache.set(cacheKey, imagePromise);
  return imagePromise;
};
