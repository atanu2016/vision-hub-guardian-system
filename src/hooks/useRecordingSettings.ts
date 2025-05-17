
import { useState } from 'react';

export function useRecordingSettings() {
  const [activeTab, setActiveTab] = useState<string>('settings');

  return {
    activeTab,
    setActiveTab
  };
}
