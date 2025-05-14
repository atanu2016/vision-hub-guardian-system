import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LogOut,
  PlusCircle,
  Search,
  Settings,
  User,
  UserCog,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import AddCameraModal from "@/components/cameras/AddCameraModal";
import { Camera } from "@/types/camera";
import { getCameras, saveCamera } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";

const TopBar = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    addNotification 
  } = useNotifications();
  
  // Load cameras when component mounts
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const loadedCameras = await getCameras();
        setCameras(loadedCameras);
      } catch (error) {
        console.error("Failed to load cameras:", error);
      }
    };
    
    loadCameras();
  }, []);
  
  // Generate groups dynamically based on camera data
  const existingGroups = Array.from(new Set(cameras.map(c => c.group || "Ungrouped")))
    .filter(group => group !== "Ungrouped");
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAddCamera = (newCamera: Omit<Camera, "id">) => {
    // Generate a unique ID
    const camera: Camera = {
      ...newCamera,
      id: `cam-${Date.now()}`,
    };
    
    // Add to cameras list
    const updatedCameras = [...cameras, camera];
    setCameras(updatedCameras);
    
    // Save to storage - fix the function name from saveCameras to saveCamera
    saveCamera(camera);
    
    // Add notification
    addNotification({
      title: "Camera Added",
      message: `${camera.name} has been added successfully`,
      type: "success"
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        
        <div className="hidden md:flex md:w-56 items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-vision-blue-500 p-1.5 rounded">
              <User size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold">Vision Hub</h2>
          </Link>
        </div>

        <div className="flex-1">
          <form className="hidden md:flex max-w-sm">
            <div className="relative w-full">
              <Search
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search cameras, recordings, alerts..."
                className="w-full pl-8 bg-secondary/50"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
            onViewAll={() => navigate('/notifications')}
          />
          
          <Separator orientation="vertical" className="hidden md:block h-8" />
          
          <Button 
            variant="outline" 
            className="flex"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Camera
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-border"
                >
                  <Avatar>
                    <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar>
                    <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-0.5">
                    <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {isAdmin && (
                      <Badge variant="outline" className="text-xs">Admin</Badge>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile-settings">
                    <UserCog className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <User className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <div className="p-2 md:hidden">
                  <ThemeToggle />
                </div>
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
      
      <AddCameraModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCamera}
        existingGroups={existingGroups}
      />
    </header>
  );
};

export default TopBar;
