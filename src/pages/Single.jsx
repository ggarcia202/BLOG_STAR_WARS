// Import necessary hooks and components from react-router-dom and other libraries.
import { Link, useParams } from "react-router-dom";  // To use link for navigation and useParams to get URL parameters
import { useEffect, useMemo, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Import a custom hook for accessing the global state
import { EntityImage } from "../components/EntityImage.jsx";
import {
  ENTITY_LABELS,
  getEntityDetailUrl,
  getFavoriteUrl
} from "../utils/starWars";

// Define and export the Single component which displays individual item details.
export const Single = () => {
  // Access the global state using the custom hook.
  const { store, dispatch } = useGlobalReducer();

  // Retrieve the 'theId' URL parameter using useParams hook.
  const { theType, theId } = useParams();
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(getEntityDetailUrl(theType, theId));

        if (!response.ok) throw new Error("No se pudo cargar el detalle.");

        const data = await response.json();
        setItemDetails(data || null);
      } catch {
        setError("No se pudo cargar el detalle.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [theType, theId]);

  const isFavorite = useMemo(() => {
    return store.favorites.some((item) => item.type === theType && item.uid === theId);
  }, [store.favorites, theType, theId]);

  const handleToggleFavorite = () => {
    const toggleFavorite = async () => {
      try {
        const response = await fetch(getFavoriteUrl(theType, theId), {
          method: isFavorite ? "DELETE" : "POST"
        });

        if (!response.ok) throw new Error("No se pudo actualizar el favorito.");

        if (isFavorite) {
          dispatch({
            type: "remove_favorite",
            payload: { type: theType, uid: String(theId) }
          });
          return;
        }

        dispatch({
          type: "add_favorite",
          payload: {
            type: theType,
            uid: String(theId),
            name: itemDetails?.name || "Sin nombre"
          }
        });
      } catch {
        setError("No se pudo actualizar favoritos. Verifica que el backend este activo.");
      }
    };

    toggleFavorite();
  };

  const detailEntries = itemDetails
    ? Object.entries(itemDetails).filter(([key, value]) => key !== "created" && key !== "edited" && value)
    : [];

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-12 col-md-5">
          <EntityImage
            type={theType}
            id={theId}
            name={itemDetails?.name}
            className="img-fluid rounded"
            alt={itemDetails?.name || "Star Wars entity"}
          />
        </div>
        <div className="col-12 col-md-7">
          <h1>{itemDetails?.name || "Cargando..."}</h1>
          <p className="text-secondary">
            Informacion detallada de {ENTITY_LABELS[theType]?.toLowerCase() || "la entidad seleccionada"}.
          </p>
          <button
            type="button"
            className={`btn ${isFavorite ? "btn-warning" : "btn-outline-warning"} me-2`}
            onClick={handleToggleFavorite}
            disabled={!itemDetails}
          >
            <i className="fa-solid fa-heart me-1" />
            {isFavorite ? "Quitar favorito" : "Guardar favorito"}
          </button>
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>

      <hr className="my-4" />
      {loading && <div className="alert alert-info">Cargando detalles...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {detailEntries.map(([key, value]) => (
                <tr key={key}>
                  <td className="text-capitalize">{key.replaceAll("_", " ")}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
