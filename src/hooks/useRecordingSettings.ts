
import { useState } from 'react';

export const useRecordingSettings = () => {
  const [activeTab, setActiveTab] = useState('settings');

  return {
    activeTab,
    setActiveTab
  };
};
