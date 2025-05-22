
import { fetchAdvancedSettingsFromDB, saveAdvancedSettingsToDB } from "../database/advancedSettingsService";

// Get advanced settings
export const getAdvancedSettings = async () => {
  return await fetchAdvancedSettingsFromDB();
};

// Save advanced settings
export const saveAdvancedSettings = async (settings: any) => {
  return await saveAdvancedSettingsToDB(settings);
};
