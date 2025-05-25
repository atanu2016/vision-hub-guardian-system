
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
}

const WebhooksSettings = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Motion Detection Alert',
      url: 'https://api.example.com/motion-alert',
      events: ['motion_detected'],
      enabled: true
    }
  ]);

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    enabled: true
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const availableEvents = [
    { id: 'motion_detected', label: 'Motion Detected' },
    { id: 'camera_offline', label: 'Camera Offline' },
    { id: 'camera_online', label: 'Camera Online' },
    { id: 'storage_warning', label: 'Storage Warning' },
    { id: 'recording_started', label: 'Recording Started' },
    { id: 'recording_stopped', label: 'Recording Stopped' }
  ];

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const webhook: Webhook = {
      id: Date.now().toString(),
      ...newWebhook
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', events: [], enabled: true });
    setShowAddForm(false);
    toast.success('Webhook added successfully');
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success('Webhook deleted');
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const handleTestWebhook = (webhook: Webhook) => {
    toast.info(`Testing webhook: ${webhook.name}`);
    // Simulate webhook test
    setTimeout(() => {
      toast.success('Webhook test completed successfully');
    }, 2000);
  };

  const handleEventToggle = (eventId: string, isNew = false) => {
    if (isNew) {
      const events = newWebhook.events.includes(eventId)
        ? newWebhook.events.filter(e => e !== eventId)
        : [...newWebhook.events, eventId];
      setNewWebhook({ ...newWebhook, events });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Webhook Settings</h1>
        <p className="text-muted-foreground">
          Configure webhooks to send notifications to external services when events occur
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Active Webhooks</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Webhook</CardTitle>
            <CardDescription>Configure a new webhook endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook-name">Webhook Name</Label>
              <Input
                id="webhook-name"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="Enter webhook name"
              />
            </div>

            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://api.example.com/webhook"
              />
            </div>

            <div>
              <Label>Events to Monitor</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableEvents.map(event => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <Switch
                      id={event.id}
                      checked={newWebhook.events.includes(event.id)}
                      onCheckedChange={() => handleEventToggle(event.id, true)}
                    />
                    <Label htmlFor={event.id} className="text-sm">{event.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWebhook}>
                Add Webhook
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {webhooks.map(webhook => (
          <Card key={webhook.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{webhook.name}</h3>
                    <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                      {webhook.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{webhook.url}</p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map(eventId => {
                      const event = availableEvents.find(e => e.id === eventId);
                      return (
                        <Badge key={eventId} variant="outline" className="text-xs">
                          {event?.label || eventId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={webhook.enabled}
                    onCheckedChange={() => handleToggleWebhook(webhook.id)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestWebhook(webhook)}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {webhooks.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No webhooks configured yet.</p>
            <Button className="mt-4" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Webhook
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebhooksSettings;
