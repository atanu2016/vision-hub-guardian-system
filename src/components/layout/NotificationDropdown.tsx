
import { useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onViewAll: () => void;
}

export const NotificationDropdown = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onViewAll,
}: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={onMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <Separator />
        
        {notifications.length > 0 ? (
          <>
            <ScrollArea className="h-[300px]">
              <div className="space-y-1 p-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex flex-col p-2 hover:bg-accent rounded-md cursor-pointer",
                      !notification.read && "bg-accent/50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 h-2 w-2 rounded-full bg-blue-500 inline-block" />
                        )}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <Separator />
            
            <div className="flex items-center justify-between p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8"
                onClick={onClearAll}
              >
                Clear All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8"
                onClick={onViewAll}
              >
                View All
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[100px]">
            <p className="text-muted-foreground">No notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
