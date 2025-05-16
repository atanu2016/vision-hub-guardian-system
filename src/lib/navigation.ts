
/**
 * Function to get the page title based on URL path
 */
export function getPageTitle(path: string): string {
  const pathWithoutSlash = path.startsWith('/') ? path.substring(1) : path;
  if (pathWithoutSlash === '') return 'Dashboard';
  
  // Convert kebab case to title case
  const words = pathWithoutSlash.split('-');
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
