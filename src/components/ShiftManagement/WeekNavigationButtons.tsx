import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekNavigationButtonsProps {
  currentWeek: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onTodayClick: () => void;
  className?: string;
}

const WeekNavigationButtons: React.FC<WeekNavigationButtonsProps> = ({
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onTodayClick,
  className,
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
    <div className={cn("flex items-center space-x-2", className)}>
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
    </div>
  );
};

export default WeekNavigationButtons;
