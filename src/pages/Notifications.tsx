
import { useState } from "react";
import { CalendarIcon, CheckCircleIcon, TrashIcon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/components/layout/NotificationDropdown";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const filterNotifications = (notificationsList: Notification[]) => {
    return notificationsList.filter(n => {
      const matchesSearch = 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesType = filterType === "all" || n.type === filterType;
      
      return matchesSearch && matchesType;
    });
  };

  const filteredUnreadNotifications = filterNotifications(unreadNotifications);
  const filteredReadNotifications = filterNotifications(readNotifications);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "All notifications marked as read",
    });
  };

  const handleClearAll = () => {
    clearAll();
    toast({
      title: "All notifications cleared",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <XCircleIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationTypeBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>;
      case "error":
        return <Badge className="bg-red-500">Error</Badge>;
      case "warning":
        return <Badge className="bg-amber-500">Warning</Badge>;
      default:
        return <Badge className="bg-blue-500">Info</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              View and manage your system notifications
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              disabled={unreadNotifications.length === 0}
            >
              Mark All as Read
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-grow">
            <Input
              type="search"
              placeholder="Search notifications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="w-full md:w-[180px]">
            <Select defaultValue="all" onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="outline" className="ml-2">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              <Badge variant="outline" className="ml-2">
                {unreadNotifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="read">
              Read
              <Badge variant="outline" className="ml-2">
                {readNotifications.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4 space-y-4">
            {filterNotifications(notifications).length > 0 ? (
              filterNotifications(notifications).map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))
            ) : (
              <EmptyState message="No notifications match your filters" />
            )}
          </TabsContent>
          
          <TabsContent value="unread" className="mt-4 space-y-4">
            {filteredUnreadNotifications.length > 0 ? (
              filteredUnreadNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))
            ) : (
              <EmptyState message="No unread notifications" />
            )}
          </TabsContent>
          
          <TabsContent value="read" className="mt-4 space-y-4">
            {filteredReadNotifications.length > 0 ? (
              filteredReadNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))
            ) : (
              <EmptyState message="No read notifications" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onRemove }: NotificationItemProps) => {
  return (
    <Card className={cn(
      "hover:bg-accent/50 transition-colors",
      !notification.read && "border-l-4 border-l-blue-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="mt-1">
              {notification.type === "success" && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
              {notification.type === "error" && <XCircleIcon className="h-5 w-5 text-red-500" />}
              {notification.type === "warning" && <XCircleIcon className="h-5 w-5 text-amber-500" />}
              {notification.type === "info" && <CheckCircleIcon className="h-5 w-5 text-blue-500" />}
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{notification.title}</h3>
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <span>{format(new Date(notification.timestamp), "PPpp")}</span>
                <Separator orientation="vertical" className="mx-2 h-3" />
                {notification.type === "success" && <Badge className="bg-green-500">Success</Badge>}
                {notification.type === "error" && <Badge className="bg-red-500">Error</Badge>}
                {notification.type === "warning" && <Badge className="bg-amber-500">Warning</Badge>}
                {notification.type === "info" && <Badge className="bg-blue-500">Info</Badge>}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!notification.read && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onMarkAsRead(notification.id)}
              >
                Mark as Read
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onRemove(notification.id)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12">
    <h3 className="text-lg font-medium">{message}</h3>
    <p className="text-muted-foreground mt-2">
      Notifications will appear here when system events occur
    </p>
  </div>
);

export default NotificationsPage;
