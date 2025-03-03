import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WeekStorage } from "@/lib/week-storage";
import { Separator } from "@/components/ui/separator";
import { Shift } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import WeekNavigationButtons from "./WeekNavigationButtons";

interface WeekManagerProps {
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
  onCreateNewWeek: () => void;
  onCopyCurrentWeek: (targetWeek: {
    start: string;
    end: string;
    formattedRange: string;
  }) => void;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  onTodayClick?: () => void;
}

const WeekManager: React.FC<WeekManagerProps> = ({
  currentWeek,
  onSelectWeek,
  onCreateNewWeek,
  onCopyCurrentWeek,
  onPreviousWeek = () => {},
  onNextWeek = () => {},
  onTodayClick = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storedWeeks, setStoredWeeks] = useState<
    { start: string; end: string; formattedRange: string }[]
  >([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState<{
    start: string;
    end: string;
    formattedRange: string;
  } | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [weekToCopyTo, setWeekToCopyTo] = useState<{
    start: string;
    end: string;
    formattedRange: string;
  } | null>(null);

  // Load stored weeks when the component mounts or when the popover opens
  useEffect(() => {
    if (isOpen) {
      loadStoredWeeks();
    }
  }, [isOpen]);

  const loadStoredWeeks = () => {
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
  };

  const handleSelectWeek = (week: {
    start: string;
    end: string;
    formattedRange: string;
  }) => {
    onSelectWeek(week);
    setIsOpen(false);
  };

  const handleDeleteWeek = (week: {
    start: string;
    end: string;
    formattedRange: string;
  }) => {
    setWeekToDelete(week);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteWeek = () => {
    if (weekToDelete) {
      // Delete the week from storage
      const weekKey = `shifts_${weekToDelete.start}_${weekToDelete.end}`;
      localStorage.removeItem(weekKey);

      // Reload the list of weeks
      loadStoredWeeks();

      // If the deleted week was the current week, switch to another week
      if (
        weekToDelete.start === currentWeek.start &&
        weekToDelete.end === currentWeek.end
      ) {
        const remainingWeeks = WeekStorage.getAllStoredWeeks();
        if (remainingWeeks.length > 0) {
          onSelectWeek(remainingWeeks[0]);
        } else {
          // If no weeks left, create a new one
          onCreateNewWeek();
        }
      }

      // Close the dialog
      setConfirmDeleteOpen(false);
      setWeekToDelete(null);

      // Show notification
      if (window.showNotification) {
        window.showNotification({
          title: "Semaine supprimée",
          description: `La semaine du ${weekToDelete.formattedRange} a été supprimée`,
          variant: "success",
          position: "bottom-right",
        });
      }
    }
  };

  const handleCopyWeek = (targetWeek: {
    start: string;
    end: string;
    formattedRange: string;
  }) => {
    setWeekToCopyTo(targetWeek);
    setCopyDialogOpen(true);
  };

  const confirmCopyWeek = () => {
    if (weekToCopyTo) {
      onCopyCurrentWeek(weekToCopyTo);
      setCopyDialogOpen(false);
      setWeekToCopyTo(null);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="relative">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentWeek.formattedRange}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b bg-slate-50">
              <h3 className="font-medium">Gestion des semaines</h3>
              <p className="text-xs text-slate-500 mt-1">
                Chaque semaine a son propre planning indépendant
              </p>
            </div>

            <div className="p-2 border-b">
              <Button
                onClick={onCreateNewWeek}
                className="w-full justify-start text-sm"
                variant="ghost"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une nouvelle semaine
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              {storedWeeks.length > 0 ? (
                <div className="py-2">
                  {storedWeeks.map((week, index) => (
                    <div
                      key={`${week.start}-${week.end}`}
                      className={`px-4 py-2 hover:bg-slate-50 ${week.start === currentWeek.start ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleSelectWeek(week)}
                        >
                          <div className="font-medium">
                            {week.formattedRange}
                          </div>
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

                        <div className="flex items-center gap-1">
                          {week.start === currentWeek.start ? (
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Actuelle
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600"
                              onClick={() => handleCopyWeek(week)}
                              title="Copier le planning actuel vers cette semaine"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => handleDeleteWeek(week)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-slate-500">
                  <Calendar className="h-10 w-10 mb-2 text-slate-300" />
                  <p>Aucune semaine enregistrée</p>
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Week Navigation Buttons - Shown outside the popover */}
        <div className="absolute -top-12 left-0 w-full flex justify-center">
          <WeekNavigationButtons
            currentWeek={currentWeek.formattedRange}
            onPreviousWeek={onPreviousWeek}
            onNextWeek={onNextWeek}
            onTodayClick={onTodayClick}
            className="bg-white shadow-sm border rounded-lg p-1"
          />
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le planning de la semaine du{" "}
              {weekToDelete?.formattedRange} ?
              <br />
              <br />
              Cette action est irréversible et supprimera définitivement tous
              les shifts de cette semaine.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteWeek}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Copy Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la copie</DialogTitle>
            <DialogDescription>
              Voulez-vous copier le planning actuel (
              {currentWeek.formattedRange}) vers la semaine du{" "}
              {weekToCopyTo?.formattedRange} ?
              <br />
              <br />
              Cette action remplacera tous les shifts existants dans la semaine
              de destination.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmCopyWeek}>Copier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WeekManager;
