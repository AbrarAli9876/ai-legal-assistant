import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  // This code runs every time the page's URL (pathname) changes
  useEffect(() => {
    // This instantly scrolls the window to the top (0,0)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;