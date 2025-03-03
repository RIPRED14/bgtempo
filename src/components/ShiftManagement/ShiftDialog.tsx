import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Calendar, User, Trash2, AlertTriangle } from "lucide-react";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import ShiftMultiSelect from "./ShiftMultiSelect";
import ShiftColorPicker from "./ShiftColorPicker";

interface ShiftDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "create" | "edit";
  shiftData?: {
    id?: string;
    employee?: string;
    day?: string;
    startTime?: string;
    endTime?: string;
    shiftType?: "morning" | "evening" | "night";
  };
  onSave?: (data: any) => void;
  onDelete?: (id: string) => void;
}

const ShiftDialog = ({
  isOpen = true,
  onOpenChange = () => {},
  mode = "create",
  shiftData = {
    employee: "",
    day: "Monday",
    startTime: "11:00",
    endTime: "17:00",
    shiftType: "morning",
  },
  onSave = () => {},
  onDelete = () => {},
}: ShiftDialogProps) => {
  const [employee, setEmployee] = useState(shiftData.employee);
  const [day, setDay] = useState(shiftData.day);
  const [startTime, setStartTime] = useState(shiftData.startTime);
  const [endTime, setEndTime] = useState(shiftData.endTime);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSave = () => {
    // Validate inputs
    if (!employee) {
      setValidationError("Veuillez sélectionner un employé");
      return;
    }

    if (!isValidTimeRange(startTime, endTime, day)) {
      setValidationError(
        "Les horaires sélectionnés ne correspondent pas aux heures d'ouverture du restaurant",
      );
      return;
    }

    // Support for multiple employees in the same shift
    const employees = employee.includes(",")
      ? employee.split(",").map((e) => e.trim())
      : [employee];

    // Show loading indicator
    setValidationError("");
    const savingIndicator = document.createElement("div");
    savingIndicator.className =
      "fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
    savingIndicator.innerHTML = `
      <div class="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
      <span>Enregistrement en cours...</span>
    `;
    document.body.appendChild(savingIndicator);

    try {
      // Create a shift for each employee
      employees.forEach((emp, index) => {
        // Map employee name to ID
        const employeeMap: Record<string, string> = {
          "John Smith": "emp-1",
          "Sarah Johnson": "emp-2",
          "Mike Williams": "emp-3",
          "Lisa Brown": "emp-4",
          "David Miller": "emp-5",
        };

        const data = {
          id: index === 0 ? shiftData.id : `shift-${Date.now()}-${index}`, // Generate unique IDs for multiple employees
          employee: emp,
          employeeId: employeeMap[emp] || "emp-1", // Add employeeId
          employeeName: emp, // Ensure employeeName is set
          day,
          startTime,
          endTime,
          shiftType: getShiftType(startTime),
        };

        // Add a small delay between multiple employee saves to prevent race conditions
        setTimeout(() => {
          onSave(data);

          // Remove the indicator after the last save
          if (index === employees.length - 1) {
            document.body.removeChild(savingIndicator);
            onOpenChange(false);
          }
        }, index * 100);
      });
    } catch (error) {
      console.error("Error saving shifts:", error);
      document.body.removeChild(savingIndicator);
      setValidationError("Une erreur est survenue lors de l'enregistrement");
    }
  };

  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (shiftData.id) {
      onDelete(shiftData.id);
      setConfirmDeleteOpen(false);
      onOpenChange(false);
    }
  };

  const getShiftType = (time: string): "morning" | "evening" | "night" => {
    const hour = parseInt(time.split(":")[0]);
    if (hour >= 11 && hour < 17) return "morning";
    if (hour >= 17 && hour < 24) return "evening";
    return "night";
  };

  // Calculate shift duration for display
  const calculateShiftDuration = () => {
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    let hours = 0;

    if (endHour > startHour) {
      hours = endHour - startHour;
    } else {
      // Handle overnight shifts
      hours = 24 - startHour + endHour;
    }

    return hours;
  };

  const isValidTimeRange = (
    start: string,
    end: string,
    day: string,
  ): boolean => {
    const startHour = parseInt(start.split(":")[0]);
    const endHour = parseInt(end.split(":")[0]);

    // Check if within restaurant hours
    if (["Sunday", "Monday", "Tuesday", "Wednesday"].includes(day)) {
      // Sun-Wed: 11h-2h
      return startHour >= 11 || (startHour >= 0 && startHour < 2);
    } else {
      // Thu-Sat: 11h-7h
      return startHour >= 11 || (startHour >= 0 && startHour < 7);
    }
  };

  // Get day name in French
  const getDayNameFr = (day: string): string => {
    const dayMap: Record<string, string> = {
      Monday: "Lundi",
      Tuesday: "Mardi",
      Wednesday: "Mercredi",
      Thursday: "Jeudi",
      Friday: "Vendredi",
      Saturday: "Samedi",
      Sunday: "Dimanche",
    };
    return dayMap[day] || day;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {mode === "create" ? "Ajouter un Shift" : "Modifier le Shift"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {validationError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{validationError}</p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-slate-500" />
              <div className="flex-1">
                <div className="space-y-2">
                  <ShiftMultiSelect
                    value={employee}
                    onChange={(val) => {
                      setEmployee(val);
                      setValidationError("");
                    }}
                    options={[
                      { label: "John Smith", value: "John Smith" },
                      { label: "Sarah Johnson", value: "Sarah Johnson" },
                      { label: "Mike Williams", value: "Mike Williams" },
                      { label: "Lisa Brown", value: "Lisa Brown" },
                      { label: "David Miller", value: "David Miller" },
                    ]}
                    placeholder="Sélectionner un ou plusieurs employés"
                  />

                  <div className="text-xs text-slate-500">
                    Vous pouvez sélectionner plusieurs employés pour ce shift.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              <div className="flex-1">
                <Select
                  value={day}
                  onValueChange={(val) => {
                    setDay(val);
                    setValidationError("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Lundi</SelectItem>
                    <SelectItem value="Tuesday">Mardi</SelectItem>
                    <SelectItem value="Wednesday">Mercredi</SelectItem>
                    <SelectItem value="Thursday">Jeudi</SelectItem>
                    <SelectItem value="Friday">Vendredi</SelectItem>
                    <SelectItem value="Saturday">Samedi</SelectItem>
                    <SelectItem value="Sunday">Dimanche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-slate-500" />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-slate-500 mb-1 block">
                    Heure de début
                  </label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setValidationError("");
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-500 mb-1 block">
                    Heure de fin
                  </label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      setValidationError("");
                    }}
                  />
                </div>
              </div>
            </div>

            <ShiftColorPicker
              value={getShiftType(startTime)}
              onChange={(shiftType) => {
                // Adjust times based on shift type
                if (shiftType === "morning") {
                  setStartTime("11:00");
                  setEndTime("17:00");
                } else if (shiftType === "evening") {
                  setStartTime("17:00");
                  setEndTime("00:00");
                } else if (shiftType === "night") {
                  setStartTime("00:00");
                  setEndTime("07:00");
                }
                setValidationError("");
              }}
            />

            <div className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-md">
              <p className="font-medium mb-1">Horaires du restaurant :</p>
              <p>Dim-Mer : 11h00 - 02h00</p>
              <p>Jeu-Sam : 11h00 - 07h00</p>
              <p className="mt-2 font-medium text-blue-600">
                Durée du shift : {calculateShiftDuration()} heures
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div>
              {mode === "edit" && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleSave}>
                {mode === "create" ? "Créer le Shift" : "Enregistrer"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={handleConfirmDelete}
        employeeName={employee}
        shiftDay={getDayNameFr(day)}
        shiftTime={startTime}
      />
    </>
  );
};

export default ShiftDialog;
