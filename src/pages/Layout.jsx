import { useEffect } from "react";
import { Outlet } from "react-router-dom"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getFavoritesUrl, normalizeFavorite } from "../utils/starWars";

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    const { dispatch } = useGlobalReducer();

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const response = await fetch(getFavoritesUrl());
                if (!response.ok) return;

                const data = await response.json();
                dispatch({
                    type: "set_favorites",
                    payload: (data || []).map((favorite) => normalizeFavorite(favorite))
                });
            } catch {
                // If backend is down we keep favorites empty.
            }
        };

        loadFavorites();
    }, [dispatch]);

    return (
        <ScrollToTop>
            <Navbar />
                <Outlet />
            <Footer />
        </ScrollToTop>
    )
}
