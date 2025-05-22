
import { useState, useMemo } from 'react';
import { Camera } from '@/types/camera';
import { toUICamera } from '@/utils/cameraPropertyMapper';

export function useFilteredCameras(cameras: Camera[]) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'recording'>('all');
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  // Convert search term to lowercase for case-insensitive matching
  const lowerSearch = search.toLowerCase();

  // Apply filters
  const filteredCameras = useMemo(() => {
    if (!cameras) return [];

    return cameras.filter(camera => {
      // Always convert to UI format for consistent property access
      const cameraUI = toUICamera(camera);
      
      // Search filter
      const matchesSearch = search === '' || 
        cameraUI.name.toLowerCase().includes(lowerSearch) || 
        cameraUI.location.toLowerCase().includes(lowerSearch) || 
        cameraUI.ipAddress?.toLowerCase().includes(lowerSearch) ||
        cameraUI.manufacturer?.toLowerCase().includes(lowerSearch) ||
        cameraUI.model?.toLowerCase().includes(lowerSearch);

      // Status filter
      const matchesStatus = statusFilter === 'all' || cameraUI.status === statusFilter;

      // Group filter
      const matchesGroup = !groupFilter || cameraUI.group === groupFilter;

      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [cameras, search, statusFilter, groupFilter, lowerSearch]);

  return {
    filteredCameras,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter
  };
}
