
import React from 'react';

interface NotificationToastProps {
  title?: string;
  description?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export function NotificationToast({ title, description, variant = 'default' }: NotificationToastProps) {
  return (
    <div className={`notification-toast ${variant === 'destructive' ? 'notification-toast-error' : ''}`}>
      {title && <div className="notification-toast-title">{title}</div>}
      {description && <div className="notification-toast-description">{description}</div>}
    </div>
  );
}
