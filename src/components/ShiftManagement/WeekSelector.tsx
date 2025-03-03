import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WeekStorage } from "@/lib/week-storage";

interface WeekSelectorProps {
  currentWeek: {
    start: string;
    end: string;
    formattedRange: string;
  };
  onSelectWeek: (week: {
    start: string;
    end: string;
    formattedRange: string;
  }) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeek,
  onSelectWeek,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storedWeeks, setStoredWeeks] = useState<
    { start: string; end: string; formattedRange: string }[]
  >([]);

  // Load stored weeks when the component mounts or when the popover opens
  useEffect(() => {
    if (isOpen) {
      const weeks = WeekStorage.getAllStoredWeeks();

      // Make sure current week is in the list
      const currentWeekExists = weeks.some(
        (week) =>
          week.start === currentWeek.start && week.end === currentWeek.end,
      );

      if (!currentWeekExists && currentWeek.start && currentWeek.end) {
        weeks.unshift(currentWeek);
      }

      setStoredWeeks(weeks);
    }
  }, [isOpen, currentWeek]);

  const handleSelectWeek = (week: {
    start: string;
    end: string;
    formattedRange: string;
  }) => {
    onSelectWeek(week);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentWeek.formattedRange}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b bg-slate-50">
          <h3 className="font-medium">Sélectionner une semaine</h3>
          <p className="text-xs text-slate-500 mt-1">
            Choisissez une semaine pour afficher son planning
          </p>
        </div>
        <ScrollArea className="h-[300px]">
          {storedWeeks.length > 0 ? (
            <div className="py-2">
              {storedWeeks.map((week, index) => (
                <div
                  key={`${week.start}-${week.end}`}
                  className={`px-4 py-2 hover:bg-slate-50 cursor-pointer ${week.start === currentWeek.start ? "bg-blue-50" : ""}`}
                  onClick={() => handleSelectWeek(week)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{week.formattedRange}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(week.start).toLocaleDateString("fr-FR", {
                          weekday: "long",
                        })}{" "}
                        -{" "}
                        {new Date(week.end).toLocaleDateString("fr-FR", {
                          weekday: "long",
                        })}
                      </div>
                    </div>
                    {week.start === currentWeek.start && (
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Actuelle
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-slate-500">
              <CalendarIcon className="h-10 w-10 mb-2 text-slate-300" />
              <p>Aucune semaine enregistrée</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default WeekSelector;
