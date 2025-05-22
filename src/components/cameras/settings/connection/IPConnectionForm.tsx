
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SettingsConnectionProps } from "../types";
import { useState, useEffect } from "react";

const IPConnectionForm = ({ 
  cameraData, 
  handleChange, 
  disabled = false,
  errors = {}
}: SettingsConnectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label htmlFor="ipAddress" className="text-sm font-medium">
          IP Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ipAddress"
          value={cameraData.ipAddress}
          onChange={(e) => handleChange('ipAddress', e.target.value)}
          placeholder="192.168.1.100"
          className={errors.ipAddress ? "border-destructive" : ""}
          disabled={disabled}
        />
        {errors.ipAddress && (
          <p className="text-xs text-destructive mt-1">{errors.ipAddress}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="port" className="text-sm font-medium">Port</Label>
        <Input
          id="port"
          type="number"
          value={cameraData.port || 80}
          onChange={(e) => handleChange('port', parseInt(e.target.value) || 80)}
          placeholder="80"
          className={errors.port ? "border-destructive" : ""}
          disabled={disabled}
        />
        {errors.port && (
          <p className="text-xs text-destructive mt-1">{errors.port}</p>
        )}
      </div>

      <div></div>
    </div>
  );
};

export default IPConnectionForm;
