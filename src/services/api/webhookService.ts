
import { fetchWebhooksFromDB, saveWebhookToDB, deleteWebhookFromDB } from "../database/webhookService";

// Fetch all webhooks
export const getWebhooks = async () => {
  return await fetchWebhooksFromDB();
};

// Save or update a webhook
export const saveWebhook = async (webhook: any) => {
  return await saveWebhookToDB(webhook);
};

// Delete a webhook
export const deleteWebhook = async (id: string) => {
  return await deleteWebhookFromDB(id);
};
