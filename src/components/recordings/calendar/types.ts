
import { DayClickEventHandler } from "react-day-picker";

// Define the props
export interface RecordingCalendarProps {
  cameraId?: string;
}

export interface RecordingDayData {
  id: string;
  time: string;
  duration: string;
  motion: boolean;
  size: string;
}

export interface RecordingTimeframeProps {
  selectedTimeframe: string | null;
  setSelectedTimeframe: (timeframe: string | null) => void;
}

export interface RecordingsByDateProps {
  isLoading: boolean;
  selectedDateRecordings: RecordingDayData[];
  selectedTimeframe: string | null;
}
