
// Format minutes to display as "X minutes"
export const formatDuration = (minutes: number): string => {
  return `${minutes} minutes`;
};

// Filter recordings based on selected camera, type, and date
export const filterRecordings = (
  recordings: any[],
  selectedCamera: string,
  selectedType: string,
  dateFilter: Date | null
): any[] => {
  return recordings.filter(recording => {
    const matchesCamera = selectedCamera === "all" || recording.cameraName === selectedCamera;
    const matchesType = selectedType === "all" || recording.type.toLowerCase() === selectedType.toLowerCase();
    const matchesDate = !dateFilter || recording.date === dateFilter.toISOString().split('T')[0];
    return matchesCamera && matchesType && matchesDate;
  });
};

// Calculate storage used based on file sizes of recordings
export const calculateStorageUsed = (recordings: any[], deletedRecordingId?: string): number => {
  const relevantRecordings = deletedRecordingId 
    ? recordings.filter((r) => r.id !== deletedRecordingId)
    : recordings;
    
  const totalSizeInMB = relevantRecordings.reduce((total, recording) => {
    const sizeInMB = parseFloat(recording.fileSize.replace(' MB', ''));
    return total + sizeInMB;
  }, 0);
  
  return totalSizeInMB / 1000; // Convert to GB
};
