import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { EntityImage } from "../components/EntityImage.jsx";
import {
	getEntityListUrl,
	ENTITY_LABELS,
	getFavoriteUrl,
	normalizeEntity
} from "../utils/starWars.js";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchEntities = async () => {
			try {
				setLoading(true);
				setError("");

				const entityTypes = ["people", "planets"];
				const requests = entityTypes.map((type) => fetch(getEntityListUrl(type)));
				const responses = await Promise.all(requests);
				const payloads = await Promise.all(
					responses.map(async (response) => {
						if (!response.ok) throw new Error("No se pudo cargar la informacion.");
						return response.json();
					})
				);

				entityTypes.forEach((type, index) => {
					const normalizedItems = (payloads[index] || []).map((item) => normalizeEntity(type, item));
					dispatch({
						type: "set_entities",
						payload: { entityType: type, items: normalizedItems }
					});
				});
			} catch {
				setError("No se pudo cargar la API del backend. Intenta de nuevo.");
			} finally {
				setLoading(false);
			}
		};

		fetchEntities();
	}, [dispatch]);

	const isFavorite = (type, uid) => {
		return store.favorites.some((item) => item.type === type && item.uid === uid);
	};

	const handleFavorite = (type, item) => {
		const toggleFavorite = async () => {
			const exists = isFavorite(type, item.uid);
			try {
				const response = await fetch(getFavoriteUrl(type, item.uid), {
					method: exists ? "DELETE" : "POST"
				});

				if (!response.ok) throw new Error("No se pudo actualizar el favorito.");

				dispatch({
					type: exists ? "remove_favorite" : "add_favorite",
					payload: exists
						? { type, uid: item.uid }
						: { type, uid: item.uid, name: item.name }
				});
			} catch {
				setError("No se pudo actualizar favoritos. Verifica que el backend este activo.");
			}
		};

		toggleFavorite();
	};

	const renderSection = (type) => {
		return (
			<section className="mb-5">
				<h2 className="text-danger mb-3">{ENTITY_LABELS[type]}</h2>
				<div className="d-flex gap-3 overflow-auto pb-2">
					{store[type].map((item) => (
						<div className="card" style={{ minWidth: "18rem" }} key={`${type}-${item.uid}`}>
							<EntityImage
								type={type}
								id={item.uid}
								name={item.name}
								className="card-img-top"
								alt={item.name}
							/>
							<div className="card-body">
								<h5 className="card-title">{item.name}</h5>
								<div className="d-flex justify-content-between align-items-center">
									<Link to={`/single/${type}/${item.uid}`} className="btn btn-outline-primary">
										Learn more!
									</Link>
									<button
										type="button"
										className={`btn ${isFavorite(type, item.uid) ? "btn-warning" : "btn-outline-warning"}`}
										onClick={() => handleFavorite(type, item)}
									>
										<i className="fa-solid fa-heart" />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>
		);
	};

	return (
		<div className="container py-4">
			<h1 className="mb-4">Star Wars Cards</h1>
			{loading && <div className="alert alert-info">Cargando informacion de la galaxia...</div>}
			{error && <div className="alert alert-danger">{error}</div>}
			{renderSection("people")}
			{renderSection("planets")}
		</div>
	);
};
