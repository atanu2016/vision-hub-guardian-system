
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown, Notification } from "@/components/layout/NotificationDropdown";

interface NotificationsButtonProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const NotificationsButton = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}: NotificationsButtonProps) => {
  const navigate = useNavigate();
  
  return (
    <NotificationDropdown
      notifications={notifications}
      onMarkAsRead={onMarkAsRead}
      onMarkAllAsRead={onMarkAllAsRead}
      onClearAll={onClearAll}
      onViewAll={() => navigate('/notifications')}
    />
  );
};

export default NotificationsButton;
