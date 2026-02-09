export const ENTITY_LABELS = {
  people: "Personajes",
  planets: "Planetas",
  vehicles: "Vehiculos"
};

export const ENTITY_IMAGE_PATH = {
  people: "people",
  planets: "planets",
  vehicles: "vehicles"
};

export const getEntityImage = (type, id) => {
  const imagePath = ENTITY_IMAGE_PATH[type];
  return `https://starwars-visualguide.com/assets/img/${imagePath}/${id}.jpg`;
};

export const getEntityListUrl = (type) => {
  return `https://www.swapi.tech/api/${type}?page=1&limit=10`;
};

export const getEntityDetailUrl = (type, id) => {
  return `https://www.swapi.tech/api/${type}/${id}`;
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
