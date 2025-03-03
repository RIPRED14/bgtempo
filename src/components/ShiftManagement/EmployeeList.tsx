import React from "react";
import { useDrop } from "react-dnd";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Clock, User, Calendar, Plus } from "lucide-react";
import ShiftBlock from "./ShiftBlock";
import { Button } from "../ui/button";

interface Employee {
  id: string;
  name: string;
  position: string;
  weeklyHours: number;
  shifts: {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    shiftType: "morning" | "evening" | "night";
  }[];
}

interface EmployeeListProps {
  employees?: Employee[];
  onEmployeeSelect?: (employeeId: string) => void;
  onShiftClick?: (shiftId: string) => void;
  selectedEmployeeId?: string;
  className?: string;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees = [
    {
      id: "emp-1",
      name: "John Smith",
      position: "Chef",
      weeklyHours: 38,
      shifts: [
        {
          id: "shift-1",
          day: "Monday",
          startTime: "11:00",
          endTime: "17:00",
          shiftType: "morning",
        },
        {
          id: "shift-2",
          day: "Wednesday",
          startTime: "17:00",
          endTime: "00:00",
          shiftType: "evening",
        },
      ],
    },
    {
      id: "emp-2",
      name: "Sarah Johnson",
      position: "Serveuse",
      weeklyHours: 25,
      shifts: [
        {
          id: "shift-3",
          day: "Tuesday",
          startTime: "17:00",
          endTime: "00:00",
          shiftType: "evening",
        },
        {
          id: "shift-4",
          day: "Friday",
          startTime: "00:00",
          endTime: "07:00",
          shiftType: "night",
        },
      ],
    },
    {
      id: "emp-3",
      name: "Mike Williams",
      position: "Barman",
      weeklyHours: 30,
      shifts: [
        {
          id: "shift-5",
          day: "Thursday",
          startTime: "17:00",
          endTime: "00:00",
          shiftType: "evening",
        },
      ],
    },
    {
      id: "emp-4",
      name: "Lisa Brown",
      position: "Serveuse",
      weeklyHours: 22,
      shifts: [
        {
          id: "shift-6",
          day: "Saturday",
          startTime: "17:00",
          endTime: "00:00",
          shiftType: "evening",
        },
      ],
    },
    {
      id: "emp-5",
      name: "David Miller",
      position: "Cuisinier",
      weeklyHours: 35,
      shifts: [
        {
          id: "shift-7",
          day: "Sunday",
          startTime: "11:00",
          endTime: "17:00",
          shiftType: "morning",
        },
      ],
    },
  ],
  onEmployeeSelect = () => {},
  onShiftClick = () => {},
  selectedEmployeeId = "",
  className = "",
}) => {
  // Setup drop target for unassigned shifts
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "SHIFT",
    drop: (item: any, monitor) => {
      // Get the drop target element
      const dropTarget = monitor.getDropTargetElement();
      if (!dropTarget) return;

      // Find the employee ID from the closest parent with data-employee-id
      let currentElement = dropTarget;
      let employeeId = null;

      while (currentElement && !employeeId) {
        employeeId = currentElement.getAttribute("data-employee-id");
        currentElement = currentElement.parentElement;
      }

      if (employeeId) {
        // Find the employee
        const employee = employees.find((emp) => emp.id === employeeId);
        if (employee) {
          console.log(
            `Shift ${item.id} dropped onto employee ${employee.name}`,
          );
          // In a real app, this would update the backend

          // If this was a move operation, delete the original shift
          if (item.id && onShiftClick) {
            onShiftClick(item.id);
          }
        }
      }

      return { moved: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
    hover: (item: any, monitor) => {
      // Could add visual feedback here
    },
  }));

  return (
    <Card
      className={`h-full w-full max-w-[250px] bg-white border-r shadow-none rounded-none ${className}`}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center">
            <User className="h-5 w-5 mr-2 text-slate-600" />
            Employés
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-180px)] px-4">
          <div className="space-y-4 pb-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                data-employee-id={employee.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${selectedEmployeeId === employee.id ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50 border border-transparent"}`}
                onClick={() => onEmployeeSelect(employee.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{employee.name}</h3>
                    <p className="text-sm text-slate-500">
                      {employee.position}
                    </p>
                  </div>
                  <Badge
                    variant={
                      selectedEmployeeId === employee.id ? "default" : "outline"
                    }
                    className={`ml-2 ${selectedEmployeeId === employee.id ? "bg-blue-500" : ""}`}
                  >
                    {employee.weeklyHours}h
                  </Badge>
                </div>

                <Separator className="my-2" />

                <div className="text-sm font-medium mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Shifts prévus</span>
                </div>

                <div
                  className="space-y-2"
                  ref={drop}
                  data-employee-id={employee.id}
                >
                  {employee.shifts.length > 0 ? (
                    employee.shifts.map((shift) => (
                      <div key={shift.id} className="scale-90 origin-left">
                        <ShiftBlock
                          id={shift.id}
                          employeeName={employee.name}
                          employeeId={employee.id}
                          day={shift.day}
                          startTime={shift.startTime}
                          endTime={shift.endTime}
                          shiftType={shift.shiftType}
                          onClick={() => onShiftClick(shift.id)}
                          isDraggable={true}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 italic py-2">
                      Aucun shift programmé
                    </div>
                  )}

                  {isOver && (
                    <div className="border-2 border-dashed border-blue-300 rounded-md h-16 flex items-center justify-center bg-blue-50">
                      <p className="text-sm text-blue-500">
                        Déposer le shift ici
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EmployeeList;
