
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { TrashIcon, PlusCircle } from "lucide-react";
import { getWebhooks, saveWebhook, deleteWebhook } from "@/services/apiService";

interface Webhook {
  id: string;
  url: string;
  name: string;
  events: string[];
  active: boolean;
}

const WebhooksSettings = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: ["all"],
    active: true
  });
  
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);

  // Load webhooks from database
  useEffect(() => {
    const loadWebhooks = async () => {
      setIsLoading(true);
      try {
        const data = await getWebhooks();
        setWebhooks(data);
      } catch (error) {
        console.error("Failed to load webhooks:", error);
        toast("Error", {
          description: "Failed to load webhooks"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWebhooks();
  }, []);

  const handleSaveWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast("Error", {
        description: "Webhook name and URL are required"
      });
      return;
    }
    
    // Save webhook to database
    const success = await saveWebhook(newWebhook);
    
    if (success) {
      // Reload webhooks
      const updatedWebhooks = await getWebhooks();
      setWebhooks(updatedWebhooks);
      
      // Reset form
      setNewWebhook({
        name: "",
        url: "",
        events: ["all"],
        active: true
      });
      setIsAddingWebhook(false);
    }
  };
  
  const handleDeleteWebhook = async (id: string) => {
    const success = await deleteWebhook(id);
    
    if (success) {
      // Remove from state
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    }
  };
  
  const handleToggleWebhook = async (webhook: Webhook) => {
    const updatedWebhook = {
      ...webhook,
      active: !webhook.active
    };
    
    const success = await saveWebhook(updatedWebhook);
    
    if (success) {
      // Update in state
      setWebhooks(webhooks.map(w => 
        w.id === webhook.id ? { ...w, active: !w.active } : w
      ));
    }
  };
  
  const getEventLabel = (event: string) => {
    switch (event) {
      case "all": return "All Events";
      case "motion_detected": return "Motion Detected";
      case "camera_offline": return "Camera Offline";
      case "storage_warning": return "Storage Warning";
      case "system_alert": return "System Alert";
      default: return event;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground">
          Connect your camera system to external services through webhooks
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Webhooks Configuration</CardTitle>
          <CardDescription>
            Webhooks allow external services to receive notifications when specific events occur in your system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading webhooks...</p>
            </div>
          ) : webhooks.length > 0 ? (
            webhooks.map(webhook => (
              <div key={webhook.id} className="flex flex-col border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{webhook.name}</h3>
                      {webhook.active ? (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 break-all">{webhook.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={webhook.active}
                      onCheckedChange={() => handleToggleWebhook(webhook)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Events:</p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map(event => (
                      <Badge key={event} variant="secondary">{getEventLabel(event)}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No webhooks configured yet. Add one below.
            </p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {isAddingWebhook ? "Add New Webhook" : "Add a Webhook"}
          </CardTitle>
          <CardDescription>
            {isAddingWebhook ? "Configure webhook details" : "Create a new webhook to notify external services"}
          </CardDescription>
        </CardHeader>
        {isAddingWebhook ? (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-name">Webhook Name</Label>
              <Input 
                id="webhook-name" 
                placeholder="Motion detection service"
                value={newWebhook.name}
                onChange={e => setNewWebhook({...newWebhook, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input 
                id="webhook-url" 
                placeholder="https://example.com/webhook"
                value={newWebhook.url}
                onChange={e => setNewWebhook({...newWebhook, url: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                This URL will receive HTTP POST requests when events occur
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-events">Events to Trigger Webhook</Label>
              <Select 
                value={newWebhook.events[0]}
                onValueChange={value => setNewWebhook({...newWebhook, events: [value]})}
              >
                <SelectTrigger id="webhook-events">
                  <SelectValue placeholder="Select events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="motion_detected">Motion Detected</SelectItem>
                  <SelectItem value="camera_offline">Camera Offline</SelectItem>
                  <SelectItem value="storage_warning">Storage Warning</SelectItem>
                  <SelectItem value="system_alert">System Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="webhook-active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this webhook
                </p>
              </div>
              <Switch 
                id="webhook-active"
                checked={newWebhook.active}
                onCheckedChange={checked => setNewWebhook({...newWebhook, active: checked})}
              />
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <p className="text-center text-muted-foreground py-2">
              Click the button below to configure a new webhook
            </p>
          </CardContent>
        )}
        <CardFooter className="flex justify-end gap-2">
          {isAddingWebhook ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingWebhook(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveWebhook}>
                Save Webhook
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsAddingWebhook(true)}
              className="w-full sm:w-auto"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default WebhooksSettings;
