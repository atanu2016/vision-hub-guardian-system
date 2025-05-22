
import { useState, useEffect } from 'react';
import { Camera } from '@/types/camera';
import { getSystemStats, getCameras } from '@/services/apiService';

interface DashboardStats {
  totalCameras: number;
  onlineCameras: number;
  offlineCameras: number;
  recordingCameras: number;
  storageUsed: string;
  storageTotal: string;
  storagePercentage: number;
  uptimeHours: number;
}

export const useDashboardData = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCameras: 0,
    onlineCameras: 0,
    offlineCameras: 0,
    recordingCameras: 0,
    storageUsed: '0 GB',
    storageTotal: '0 GB',
    storagePercentage: 0,
    uptimeHours: 0
  });

  // Fetch cameras and system stats
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get cameras
        const camerasData = await getCameras();
        setCameras(camerasData);
        
        // Get system stats
        const statsData = await getSystemStats();
        
        // Calculate counts based on camera data if no stats are available
        if (!statsData) {
          const online = camerasData.filter(cam => cam.status === 'online').length;
          const recording = camerasData.filter(cam => cam.status === 'recording').length;
          const offline = camerasData.filter(cam => cam.status === 'offline').length;
          
          setStats({
            totalCameras: camerasData.length,
            onlineCameras: online,
            offlineCameras: offline,
            recordingCameras: recording,
            storageUsed: '0 GB',
            storageTotal: '0 GB',
            storagePercentage: 0,
            uptimeHours: 0
          });
        } else {
          // Use stats from the system
          setStats({
            totalCameras: statsData.total_cameras || 0,
            onlineCameras: statsData.online_cameras || 0,
            offlineCameras: statsData.offline_cameras || 0,
            recordingCameras: statsData.recording_cameras || 0,
            storageUsed: statsData.storage_used || '0 GB',
            storageTotal: statsData.storage_total || '0 GB',
            storagePercentage: statsData.storage_percentage || 0,
            uptimeHours: statsData.uptime_hours || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Set fallback data based on cameras
        const online = cameras.filter(cam => cam.status === 'online').length;
        const recording = cameras.filter(cam => cam.status === 'recording').length;
        const offline = cameras.filter(cam => cam.status === 'offline').length;
        
        setStats({
          totalCameras: cameras.length,
          onlineCameras: online,
          offlineCameras: offline,
          recordingCameras: recording,
          storageUsed: '0 GB',
          storageTotal: '0 GB',
          storagePercentage: 0,
          uptimeHours: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return { cameras, stats, loading };
};
