
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Phase 70: App Shell Hardening — Scroll restoration.
 * Scrolls the window to the top whenever the route pathname changes.
 * Renders nothing; drop alongside <DocumentTitleSync /> inside <Router>.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
