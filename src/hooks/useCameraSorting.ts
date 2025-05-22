
import { useState, useMemo } from 'react';
import { Camera, GroupedCameras } from '@/types/camera';

export type SortKey = 'name' | 'status' | 'location' | 'lastSeen';
export type SortDirection = 'asc' | 'desc';
export type GroupByOption = 'location' | 'status' | 'none';

export const useCameraSorting = (cameras: Camera[]) => {
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [groupBy, setGroupBy] = useState<GroupByOption>('location');

  // Sort cameras based on current sort key and direction
  const sortedCameras = useMemo(() => {
    return [...cameras].sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'location':
          valueA = a.location?.toLowerCase() || '';
          valueB = b.location?.toLowerCase() || '';
          break;
        case 'lastSeen':
          valueA = new Date(a.lastseen).getTime();
          valueB = new Date(b.lastseen).getTime();
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [cameras, sortBy, sortDirection]);

  // Change sort key
  const changeSortBy = (key: SortKey) => {
    if (key === sortBy) {
      // If clicking the same column, toggle direction
      toggleSortDirection();
    } else {
      // If clicking a different column, set it as the new sort key
      setSortBy(key);
      setSortDirection('asc'); // Reset to ascending when changing columns
    }
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(current => (current === 'asc' ? 'desc' : 'asc'));
  };

  // Group cameras by specified property
  const getSortedCameras = (filteredCameras = sortedCameras): GroupedCameras[] => {
    if (groupBy === 'none') {
      // Return as a single group when no grouping is applied
      return [
        {
          id: 'all-cameras',
          name: 'All Cameras',
          cameras: filteredCameras
        }
      ];
    }

    const groups: Record<string, Camera[]> = {};

    // Group cameras by the specified property
    filteredCameras.forEach(camera => {
      let groupKey = '';
      
      if (groupBy === 'location') {
        groupKey = camera.location || 'Unknown Location';
      } else if (groupBy === 'status') {
        groupKey = camera.status || 'Unknown Status';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(camera);
    });

    // Convert grouped object to array format
    return Object.entries(groups).map(([name, groupCameras]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      cameras: groupCameras
    }));
  };

  return {
    sortBy,
    sortDirection,
    sortedCameras,
    changeSortBy,
    toggleSortDirection,
    groupBy,
    setGroupBy,
    getSortedCameras
  };
};
