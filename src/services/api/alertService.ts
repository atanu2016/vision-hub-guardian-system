
import { fetchAlertSettingsFromDB, saveAlertSettingsToDB } from "@/services/database";

/**
 * Get alert settings from database
 */
export const getAlertSettings = async () => {
  try {
    return await fetchAlertSettingsFromDB();
  } catch (err) {
    console.error('Error fetching alert settings:', err);
    // Return default settings if an error occurs
    return {
      motionDetection: true,
      cameraOffline: true,
      storageWarning: true,
      emailNotifications: false,
      pushNotifications: false,
      emailAddress: "",
      notificationSound: "default"
    };
  }
};

/**
 * Save alert settings to database
 */
export const saveAlertSettings = async (settings: any) => {
  try {
    return await saveAlertSettingsToDB(settings);
  } catch (err) {
    console.error('Error saving alert settings:', err);
    throw err;
  }
};
