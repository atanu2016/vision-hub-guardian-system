
import { useState, useMemo } from 'react';
import { Camera } from '@/types/camera';
import { toUICamera } from '@/utils/cameraPropertyMapper';

type SortKey = 'name' | 'location' | 'status' | 'lastSeen';
type SortDirection = 'asc' | 'desc';

export function useCameraSorting(cameras: Camera[]) {
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Change sort key
  const changeSortBy = (key: SortKey) => {
    if (sortBy === key) {
      toggleSortDirection();
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  // Sorted cameras
  const sortedCameras = useMemo(() => {
    if (!cameras || cameras.length === 0) return [];
    
    return [...cameras].sort((a, b) => {
      // Convert to UI format for easier property access
      const aUI = toUICamera(a);
      const bUI = toUICamera(b);
      
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = aUI.name.localeCompare(bUI.name);
          break;
        case 'location':
          comparison = aUI.location.localeCompare(bUI.location);
          break;
        case 'status':
          comparison = aUI.status.localeCompare(bUI.status);
          break;
        case 'lastSeen':
          comparison = new Date(aUI.lastSeen).getTime() - new Date(bUI.lastSeen).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [cameras, sortBy, sortDirection]);

  return {
    sortedCameras,
    sortBy,
    sortDirection,
    changeSortBy,
    toggleSortDirection
  };
}
