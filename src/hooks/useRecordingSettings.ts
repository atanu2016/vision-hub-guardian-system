
import { useState } from 'react';

export const useRecordingSettings = () => {
  const [activeTab, setActiveTab] = useState<string>("settings");
  
  return {
    activeTab,
    setActiveTab,
  };
};
