
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';

// Helper function to format date for filenames
const getFormattedDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Convert JSON data to CSV format
const jsonToCSV = (data: any[]) => {
  if (!data || !data.length) return '';
  
  const header = Object.keys(data[0]).join(',');
  const rows = data.map(item => 
    Object.values(item)
      .map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val)
      .join(',')
  );
  
  return [header, ...rows].join('\n');
};

// Export recordings data
export const exportRecordings = async () => {
  try {
    // Get cameras data
    const { data: cameras, error: camerasError } = await supabase
      .from('cameras')
      .select('id, name, location');
    
    if (camerasError) throw camerasError;
    
    // Get recording status for each camera
    const { data: recordingStatus, error: recordingError } = await supabase
      .from('camera_recording_status')
      .select('*');
    
    if (recordingError) throw recordingError;
    
    // Combine data
    const exportData = cameras.map(camera => {
      const status = recordingStatus?.find(rs => rs.camera_id === camera.id);
      
      return {
        camera_name: camera.name,
        camera_location: camera.location,
        recording_enabled: status?.enabled ? 'Yes' : 'No',
        last_updated: status?.updated_at || 'N/A'
      };
    });
    
    const csvContent = jsonToCSV(exportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `vision-hub-recordings-${getFormattedDate()}.csv`);
    
    return true;
  } catch (error) {
    console.error('Failed to export recordings:', error);
    throw error;
  }
};

// Export alerts history
export const exportAlertHistory = async () => {
  try {
    // Get system logs related to alerts
    const { data: logs, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('level', 'alert')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    // Format for export
    const exportData = logs?.map(log => ({
      timestamp: log.timestamp,
      message: log.message,
      source: log.source,
      details: log.details || 'N/A'
    })) || [];
    
    const csvContent = jsonToCSV(exportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `vision-hub-alerts-${getFormattedDate()}.csv`);
    
    return true;
  } catch (error) {
    console.error('Failed to export alert history:', error);
    throw error;
  }
};

// Export system configuration
export const exportConfiguration = async () => {
  try {
    // Collect all settings
    const [
      { data: storageSettings, error: storageError },
      { data: recordingSettings, error: recordingError },
      { data: alertSettings, error: alertError },
      { data: advancedSettings, error: advancedError },
    ] = await Promise.all([
      supabase.from('storage_settings').select('*').single(),
      supabase.from('recording_settings').select('*').single(),
      supabase.from('alert_settings').select('*').single(),
      supabase.from('advanced_settings').select('*').single(),
    ]);
    
    if (storageError || recordingError || alertError || advancedError) 
      throw new Error('Failed to fetch configuration');
    
    // Combine all settings into one object
    const configData = {
      storage: storageSettings,
      recording: recordingSettings,
      alerts: alertSettings,
      advanced: advancedSettings,
      export_date: new Date().toISOString(),
    };
    
    // Export as JSON
    const jsonContent = JSON.stringify(configData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    saveAs(blob, `vision-hub-config-${getFormattedDate()}.json`);
    
    return true;
  } catch (error) {
    console.error('Failed to export configuration:', error);
    throw error;
  }
};
