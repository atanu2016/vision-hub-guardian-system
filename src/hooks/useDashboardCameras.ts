
import { useState, useMemo } from 'react';
import { Camera } from "@/types/camera";
import { SortKey, SortDirection } from "@/components/dashboard/CameraControls";

export const useDashboardCameras = (cameras: Camera[]) => {
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [grouping, setGrouping] = useState<'none' | 'location'>('none');

  const changeSortBy = (key: SortKey) => {
    if (sortBy === key) {
      toggleSortDirection();
    } else {
      setSortBy(key);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedCameras = useMemo(() => {
    const sortFunction = (a: Camera, b: Camera): number => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (sortBy === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (sortBy === 'location') {
        aValue = a.location;
        bValue = b.location;
      } else if (sortBy === 'status') {
        const statusOrder = {
          online: 1,
          recording: 2,
          offline: 3,
        };
        aValue = statusOrder[a.status as keyof typeof statusOrder] || 4;
        bValue = statusOrder[b.status as keyof typeof statusOrder] || 4;
      } else if (sortBy === 'lastSeen') {
        aValue = new Date(a.lastseen).getTime();
        bValue = new Date(b.lastseen).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      } else {
        return 0;
      }
    };

    const sorted = [...cameras].sort(sortFunction);
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [cameras, sortBy, sortDirection]);

  return {
    sortedCameras,
    sortBy,
    sortDirection,
    changeSortBy,
    toggleSortDirection,
    grouping,
    setGrouping
  };
};
