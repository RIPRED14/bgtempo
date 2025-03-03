import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const notificationVariants = cva(
  "fixed z-50 flex items-center gap-3 rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-white text-slate-800 border border-slate-200",
        success: "bg-green-50 text-green-800 border border-green-200",
        error: "bg-red-50 text-red-800 border border-red-200",
        warning: "bg-amber-50 text-amber-800 border border-amber-200",
        info: "bg-blue-50 text-blue-800 border border-blue-200",
      },
      position: {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-center": "top-4 left-1/2 -translate-x-1/2",
        "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "top-right",
    },
  },
);

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  (
    {
      className,
      variant,
      position,
      title,
      description,
      icon,
      onClose,
      autoClose = true,
      autoCloseDelay = 5000,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose?.();
          }, 300); // Wait for fade out animation
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    }, [autoClose, autoCloseDelay, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for fade out animation
    };

    // Determine icon based on variant
    const getIcon = () => {
      if (icon) return icon;

      switch (variant) {
        case "success":
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        case "error":
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        case "warning":
          return <AlertCircle className="h-5 w-5 text-amber-500" />;
        case "info":
          return <Info className="h-5 w-5 text-blue-500" />;
        default:
          return <Bell className="h-5 w-5 text-slate-500" />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          notificationVariants({ variant, position }),
          isVisible ? "opacity-100" : "opacity-0 translate-y-2",
          className,
        )}
        {...props}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          {title && <h4 className="font-medium">{title}</h4>}
          {description && <p className="text-sm">{description}</p>}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 rounded-full p-1 hover:bg-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  },
);

Notification.displayName = "Notification";

export { Notification };
