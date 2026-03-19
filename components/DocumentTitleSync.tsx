import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageTitleForPath } from '../lib/documentTitle';

/** IA: Sync document title with current route for tabs, bookmarks, and SR context. */
const DocumentTitleSync: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = pageTitleForPath(pathname);
  }, [pathname]);
  return null;
};

export default DocumentTitleSync;
