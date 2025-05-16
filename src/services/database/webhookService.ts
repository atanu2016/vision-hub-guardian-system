
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logDatabaseError } from "./baseService";

// Webhook operations
export const fetchWebhooksFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at');
      
    if (error) {
      console.error("Error fetching webhooks:", error);
      throw error;
    }
    
    // Transform to our format
    return data.map(webhook => ({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active
    }));
  } catch (error) {
    logDatabaseError(error, "Failed to load webhooks");
    return [];
  }
};

export const saveWebhookToDB = async (webhook: any) => {
  try {
    const { id, ...webhookData } = webhook;
    
    if (id) {
      // Update
      const { error } = await supabase
        .from('webhooks')
        .update({
          name: webhookData.name,
          url: webhookData.url,
          events: webhookData.events,
          active: webhookData.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('webhooks')
        .insert({
          name: webhookData.name,
          url: webhookData.url,
          events: webhookData.events,
          active: webhookData.active
        });
        
      if (error) throw error;
    }
    
    toast("Success", {
      description: "Webhook saved successfully"
    });
    
    return true;
  } catch (error) {
    logDatabaseError(error, "Failed to save webhook");
    return false;
  }
};

export const deleteWebhookFromDB = async (id: string) => {
  try {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    toast("Success", {
      description: "Webhook deleted successfully"
    });
    
    return true;
  } catch (error) {
    logDatabaseError(error, "Failed to delete webhook");
    return false;
  }
};
