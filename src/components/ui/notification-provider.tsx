import * as React from "react";
import { createContext, useContext, useState } from "react";
import { Notification, NotificationProps } from "./notification";

type NotificationItem = NotificationProps & {
  id: string;
};

type NotificationContextType = {
  notifications: NotificationItem[];
  showNotification: (props: Omit<NotificationProps, "onClose">) => string;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = (props: Omit<NotificationProps, "onClose">) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification = { ...props, id };
    setNotifications((prev) => [...prev, notification]);
    return id;
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        dismissNotification,
        dismissAllNotifications,
      }}
    >
      {children}
      <div className="notification-container">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={() => dismissNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}
