
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

interface FirewallRule {
  id: string;
  port: string;
  protocol: "tcp" | "udp" | "both";
  description: string;
  enabled: boolean;
}

const defaultRules: FirewallRule[] = [
  { id: "1", port: "80", protocol: "tcp", description: "HTTP Web Server", enabled: true },
  { id: "2", port: "443", protocol: "tcp", description: "HTTPS Web Server", enabled: true },
  { id: "3", port: "22", protocol: "tcp", description: "SSH Access", enabled: true },
  { id: "4", port: "3478", protocol: "both", description: "RTSP Camera Stream", enabled: true },
  { id: "5", port: "8123", protocol: "tcp", description: "API Server", enabled: true },
];

export default function FirewallSettings() {
  const [firewallEnabled, setFirewallEnabled] = useState(true);
  const [rules, setRules] = useState<FirewallRule[]>(defaultRules);
  const [newRule, setNewRule] = useState<Omit<FirewallRule, "id">>({
    port: "",
    protocol: "tcp",
    description: "",
    enabled: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock loading the firewall settings from the server
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const handleToggleFirewall = () => {
    setFirewallEnabled(!firewallEnabled);
    toast(firewallEnabled ? "Firewall Disabled" : "Firewall Enabled", {
      description: firewallEnabled 
        ? "The firewall has been turned off. Your system may be vulnerable." 
        : "The firewall is now active and protecting your system.",
      icon: firewallEnabled ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />
    });
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleAddRule = () => {
    if (!newRule.port) {
      toast.error("Port number is required");
      return;
    }
    
    const newId = (rules.length + 1).toString();
    setRules([...rules, { ...newRule, id: newId }]);
    setNewRule({
      port: "",
      protocol: "tcp",
      description: "",
      enabled: true
    });
    
    toast.success("Firewall rule added", {
      description: `Added rule for port ${newRule.port}`
    });
  };

  const handleRemoveRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast.success("Firewall rule removed");
  };

  const handleSaveRules = () => {
    setIsLoading(true);
    
    // Simulate an API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Firewall settings saved", {
        description: "Your firewall configuration has been updated"
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Firewall Settings
          </CardTitle>
          <CardDescription>
            Configure network security and access control
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="firewall-toggle" className={firewallEnabled ? "text-green-600" : "text-red-500"}>
            {firewallEnabled ? "Enabled" : "Disabled"}
          </Label>
          <Switch
            id="firewall-toggle"
            checked={firewallEnabled}
            onCheckedChange={handleToggleFirewall}
            aria-label="Toggle firewall"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-2">
                {firewallEnabled ? (
                  <div className="flex items-center text-green-600">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    <span>Firewall is active and protecting your system</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <ShieldOff className="h-4 w-4 mr-1" />
                    <span>Warning: Firewall is disabled. Your system may be vulnerable.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Port Rules</h3>
              <div className="border rounded-md divide-y">
                {rules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{rule.port} ({rule.protocol.toUpperCase()})</div>
                      <div className="text-sm text-muted-foreground">{rule.description}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                        aria-label={`Toggle rule ${rule.port}`}
                        disabled={!firewallEnabled}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRule(rule.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={!firewallEnabled}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Add New Rule</h3>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3">
                  <Label htmlFor="port" className="text-xs">Port</Label>
                  <Input
                    id="port"
                    placeholder="80"
                    value={newRule.port}
                    onChange={e => setNewRule({ ...newRule, port: e.target.value })}
                    disabled={!firewallEnabled}
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="protocol" className="text-xs">Protocol</Label>
                  <select
                    id="protocol"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={newRule.protocol}
                    onChange={e => setNewRule({ ...newRule, protocol: e.target.value as "tcp" | "udp" | "both" })}
                    disabled={!firewallEnabled}
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="col-span-4">
                  <Label htmlFor="description" className="text-xs">Description</Label>
                  <Input
                    id="description"
                    placeholder="HTTP Server"
                    value={newRule.description}
                    onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                    disabled={!firewallEnabled}
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <Button 
                    onClick={handleAddRule} 
                    disabled={!firewallEnabled || !newRule.port}
                    className="w-full"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveRules} disabled={isLoading || !firewallEnabled}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
