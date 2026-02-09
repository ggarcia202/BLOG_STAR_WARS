import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// This component allows the scroll to go to the beginning when changing the view,
// otherwise it would remain in the position of the previous view. 
// Investigate more about this React behavior :D 

const ScrollToTop = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return children;
};

export default ScrollToTop;

ScrollToTop.propTypes = {
    children: PropTypes.any
};
