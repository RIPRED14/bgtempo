import React, { useState } from "react";
import { Button } from "./button";
import { Bell, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";
import { useNotification } from "./notification-provider";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
  className?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "success" | "error" | "info" | "warning";
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Bienvenue dans le système",
      message:
        "Vous êtes maintenant connecté au système de gestion des employés.",
      timestamp: new Date(),
      read: false,
      type: "info",
    },
    {
      id: "2",
      title: "Employé ajouté",
      message: "L'employé Jean Dupont a été ajouté avec succès.",
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      type: "success",
    },
    {
      id: "3",
      title: "Erreur de synchronisation",
      message:
        "La synchronisation avec la base de données a échoué. Veuillez réessayer.",
      timestamp: new Date(Date.now() - 7200000),
      read: true,
      type: "error",
    },
  ]);

  const { showNotification } = useNotification();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return `Il y a ${diffDays} j`;
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
            variant="destructive"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border">
          <div className="p-3 bg-slate-50 border-b flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={markAllAsRead}
                >
                  Tout marquer comme lu
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[300px]">
            {notifications.length > 0 ? (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "px-4 py-3 hover:bg-slate-50 transition-colors border-l-2",
                      notification.read
                        ? "border-transparent"
                        : notification.type === "success"
                          ? "border-green-500"
                          : notification.type === "error"
                            ? "border-red-500"
                            : notification.type === "warning"
                              ? "border-amber-500"
                              : "border-blue-500",
                      !notification.read && "bg-blue-50/50",
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {getIcon(notification.type)}
                        <span className="font-medium text-sm">
                          {notification.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 pl-7">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-slate-500">
                <Bell className="h-10 w-10 mb-2 text-slate-300" />
                <p>Aucune notification</p>
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="p-2 bg-slate-50 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={clearAll}
              >
                Effacer toutes les notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
