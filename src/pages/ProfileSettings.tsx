
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
}

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get user from localStorage (in a real app, this would come from an auth context)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
    return {
      id: "1",
      fullName: "Admin User",
      email: "admin@example.com",
      role: "Administrator",
    };
  });

  const [formData, setFormData] = useState({
    fullName: profile.fullName || "",
    email: profile.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Check if changing password
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        toast({
          title: "Current Password Required",
          description: "Please enter your current password",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "New passwords do not match",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.newPassword.length < 8) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 8 characters",
          variant: "destructive",
        });
        return;
      }
    }

    // In a real app, this would call an API to update the profile
    // and handle the avatar upload separately
    
    // Update the profile
    const updatedProfile = {
      ...profile,
      fullName: formData.fullName,
      email: formData.email,
    };
    
    if (avatarPreview) {
      updatedProfile.avatar = avatarPreview;
    }
    
    // Save to localStorage for demo
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
    
    // Clear password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                      required
                    />
                  </div>
                  <div>
                    <Label>User Role</Label>
                    <Input
                      value={profile.role}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Update your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleProfileUpdate}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfileSettings;
