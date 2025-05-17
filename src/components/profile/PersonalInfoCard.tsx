
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { ProfileFormData } from "@/hooks/useProfileSettings";

interface PersonalInfoCardProps {
  formData: ProfileFormData;
  role: string;
  avatarPreview?: string;
  getInitials: (name: string) => string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleProfileUpdate: (e: React.FormEvent) => void;
}

export const PersonalInfoCard = ({
  formData,
  role,
  avatarPreview,
  getInitials,
  handleInputChange,
  handleAvatarChange,
  handleProfileUpdate
}: PersonalInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleProfileUpdate}>
          <div className="flex justify-center">
            <div className="relative group">
              <Avatar className="h-24 w-24 border">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt={formData.fullName} />
                ) : (
                  <AvatarFallback className="text-xl font-semibold">
                    {getInitials(formData.fullName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-white cursor-pointer hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label>User Role</Label>
              <Input
                value={role.charAt(0).toUpperCase() + role.slice(1)}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
};
