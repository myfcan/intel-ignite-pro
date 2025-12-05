import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Component that fixes URL encoding issues like %3F instead of ?
 * This can happen from external redirects or cached URLs
 */
export function URLFixer() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the pathname contains encoded characters that shouldn't be there
    const currentPath = location.pathname;
    
    // Detect %3F (encoded ?) in pathname - this is wrong, query params should use actual ?
    if (currentPath.includes('%3F') || currentPath.includes('%3f')) {
      const decodedPath = decodeURIComponent(currentPath);
      
      // If decoding reveals a query string in the path, fix it
      if (decodedPath.includes('?')) {
        const [path, query] = decodedPath.split('?');
        const newUrl = query ? `${path}?${query}` : path;
        
        console.log('[URLFixer] Fixing encoded URL:', currentPath, '->', newUrl);
        navigate(newUrl, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return null;
}
