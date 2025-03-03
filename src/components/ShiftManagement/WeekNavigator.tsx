import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { WeekStorage } from "@/lib/week-storage";
import { cn } from "@/lib/utils";

interface WeekNavigatorProps {
  currentWeek: {
    start: string;
    end: string;
    formattedRange: string;
  };
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onTodayClick: () => void;
  className?: string;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onTodayClick,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextWeek, setHasNextWeek] = useState(true);
  const [hasPrevWeek, setHasPrevWeek] = useState(true);

  // Check if adjacent weeks exist in storage
  useEffect(() => {
    const storedWeeks = WeekStorage.getAllStoredWeeks();

    // Find current week index
    const currentIndex = storedWeeks.findIndex(
      (week) =>
        week.start === currentWeek.start && week.end === currentWeek.end,
    );

    // If current week is found, check if there are weeks before and after
    if (currentIndex !== -1) {
      setHasPrevWeek(currentIndex < storedWeeks.length - 1);
      setHasNextWeek(currentIndex > 0);
    } else {
      // If current week is not in storage, assume both directions are available
      setHasPrevWeek(true);
      setHasNextWeek(true);
    }
  }, [currentWeek]);

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
    <div className={cn("flex items-center space-x-4", className)}>
      <div className="flex items-center bg-slate-100 rounded-lg p-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleWeekChange("prev")}
          disabled={isLoading || !hasPrevWeek}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="px-3 font-medium">{currentWeek.formattedRange}</div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleWeekChange("next")}
          disabled={isLoading || !hasNextWeek}
          className="h-8 w-8"
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

export default WeekNavigator;
