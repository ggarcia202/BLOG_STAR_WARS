export const initialStore = () => {
  return {
    people: [],
    planets: [],
    favorites: []
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_entities": {
      const { entityType, items } = action.payload;
      return {
        ...store,
        [entityType]: items
      };
    }
    case "set_favorites": {
      return {
        ...store,
        favorites: action.payload
      };
    }
    case "add_favorite": {
      const favorite = action.payload;
      const alreadyExists = store.favorites.some(
        (item) => item.type === favorite.type && item.uid === favorite.uid
      );

      if (alreadyExists) return store;

      return {
        ...store,
        favorites: [...store.favorites, favorite]
      };
    }
    case "remove_favorite": {
      const { type, uid } = action.payload;
      return {
        ...store,
        favorites: store.favorites.filter(
          (item) => !(item.type === type && item.uid === uid)
        )
      };
    }
    default:
      throw Error("Unknown action.");
  }
}
