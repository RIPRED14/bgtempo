import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import {
  NotificationProvider,
  useNotification,
} from "./components/ui/notification-provider";
import { NotificationService } from "./lib/notification-service";

// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Initialize the notification service
function NotificationInitializer() {
  const { showNotification, dismissNotification, dismissAllNotifications } =
    useNotification();

  React.useEffect(() => {
    NotificationService.init({
      showNotification,
      dismissNotification,
      dismissAllNotifications,
    });
  }, [showNotification, dismissNotification, dismissAllNotifications]);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NotificationProvider>
      <NotificationInitializer />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </NotificationProvider>
  </React.StrictMode>,
);
