import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowLeft,
  Info,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface HeaderProps {
  restaurantName?: string;
  currentWeek?: string;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  onTodayClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  restaurantName = "Burger Staff Manager",
  currentWeek = "May 1 - May 7, 2023",
  onPreviousWeek = () => {},
  onNextWeek = () => {},
  onTodayClick = () => {},
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleWeekChange = (direction: "prev" | "next") => {
    setIsLoading(true);

    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
      if (direction === "prev") {
        onPreviousWeek();
      } else {
        onNextWeek();
      }
    }, 300);
  };

  return (
    <header className="bg-white border-b border-slate-200 py-3 px-4 flex items-center justify-between h-16 w-full">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-slate-900">{restaurantName}</h1>
        <span className="mx-3 text-slate-300">|</span>
        <h2 className="text-lg font-medium text-slate-600">
          Planning Hebdomadaire
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleWeekChange("prev")}
            disabled={isLoading}
            className="h-8 w-8"
            aria-label="Semaine précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="px-3 font-medium">{currentWeek}</div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleWeekChange("next")}
            disabled={isLoading}
            className="h-8 w-8"
            aria-label="Semaine suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onTodayClick}
          className={cn(
            "flex items-center",
            isLoading && "opacity-50 cursor-not-allowed",
          )}
          disabled={isLoading}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Aujourd'hui
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => {
              if (window.showNotification) {
                window.showNotification({
                  title: "Planning par semaine",
                  description:
                    "Chaque semaine a son propre planning indépendant. Vous pouvez naviguer entre les semaines avec les flèches et chaque modification sera enregistrée pour la semaine en cours uniquement.",
                  variant: "info",
                  position: "bottom-right",
                  autoCloseDelay: 10000,
                });
              }
            }}
          >
            <Info className="h-4 w-4" />
            Aide
          </Button>

          <a
            href="/"
            className="text-slate-500 hover:text-slate-700 flex items-center text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au Dashboard
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
