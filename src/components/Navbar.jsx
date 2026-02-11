import { useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getFavoriteUrl } from "../utils/starWars";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const [error, setError] = useState("");

	const handleRemoveFavorite = (type, uid) => {
		const removeFavorite = async () => {
			try {
				setError("");
				const response = await fetch(getFavoriteUrl(type, uid), { method: "DELETE" });
				if (!response.ok) throw new Error("No se pudo eliminar favorito.");

				dispatch({
					type: "remove_favorite",
					payload: { type, uid }
				});
			} catch {
				setError("No se pudo eliminar favorito.");
			}
		};

		removeFavorite();
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">Star Wars Blog</span>
				</Link>
				<div className="dropdown">
					<button
						className="btn btn-warning dropdown-toggle"
						type="button"
						data-bs-toggle="dropdown"
						aria-expanded="false"
					>
						Favoritos ({store.favorites.length})
					</button>
					<ul className="dropdown-menu dropdown-menu-end">
						{store.favorites.length === 0 ? (
							<li className="dropdown-item text-muted">No hay favoritos</li>
						) : (
							store.favorites.map((favorite) => (
								<li
									key={`${favorite.type}-${favorite.uid}`}
									className="dropdown-item d-flex justify-content-between align-items-center"
								>
									<Link
										className="text-decoration-none text-dark"
										to={`/single/${favorite.type}/${favorite.uid}`}
									>
										{favorite.name}
									</Link>
									<button
										type="button"
										className="btn btn-sm"
										onClick={() => handleRemoveFavorite(favorite.type, favorite.uid)}
									>
										<i className="fa-solid fa-trash text-danger" />
									</button>
								</li>
							))
						)}
					</ul>
				</div>
			</div>
			{error && <div className="container text-danger small pb-2">{error}</div>}
		</nav>
	);
};
