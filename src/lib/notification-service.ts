import { NotificationProps } from "@/components/ui/notification";

// Define a global interface to make TypeScript happy
declare global {
  interface Window {
    showNotification?: (props: Omit<NotificationProps, "onClose">) => string;
    dismissNotification?: (id: string) => void;
    dismissAllNotifications?: () => void;
  }
}

/**
 * A service for showing notifications throughout the application
 * This provides a global way to show notifications without needing to import React hooks
 */
export class NotificationService {
  /**
   * Initialize the notification service by attaching methods to the window object
   * This should be called once when the app starts
   */
  static init(methods: {
    showNotification: (props: Omit<NotificationProps, "onClose">) => string;
    dismissNotification: (id: string) => void;
    dismissAllNotifications: () => void;
  }) {
    window.showNotification = methods.showNotification;
    window.dismissNotification = methods.dismissNotification;
    window.dismissAllNotifications = methods.dismissAllNotifications;
    console.log("NotificationService initialized");
  }

  /**
   * Show a notification
   */
  static show(props: Omit<NotificationProps, "onClose">): string | undefined {
    if (window.showNotification) {
      return window.showNotification(props);
    } else {
      console.error("NotificationService not initialized");
      return undefined;
    }
  }

  /**
   * Show a success notification
   */
  static success(message: string, title = "Succès"): string | undefined {
    return this.show({
      title,
      description: message,
      variant: "success",
      position: "bottom-right",
    });
  }

  /**
   * Show an error notification
   */
  static error(message: string, title = "Erreur"): string | undefined {
    return this.show({
      title,
      description: message,
      variant: "error",
      position: "bottom-right",
    });
  }

  /**
   * Show an info notification
   */
  static info(message: string, title = "Information"): string | undefined {
    return this.show({
      title,
      description: message,
      variant: "info",
      position: "bottom-right",
    });
  }

  /**
   * Show a warning notification
   */
  static warning(message: string, title = "Attention"): string | undefined {
    return this.show({
      title,
      description: message,
      variant: "warning",
      position: "bottom-right",
    });
  }

  /**
   * Dismiss a notification by ID
   */
  static dismiss(id: string): void {
    if (window.dismissNotification) {
      window.dismissNotification(id);
    } else {
      console.error("NotificationService not initialized");
    }
  }

  /**
   * Dismiss all notifications
   */
  static dismissAll(): void {
    if (window.dismissAllNotifications) {
      window.dismissAllNotifications();
    } else {
      console.error("NotificationService not initialized");
    }
  }
}
