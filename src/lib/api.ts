import { supabase } from "./supabase";
import { Database } from "@/types/supabase";

export interface Employee {
  id: string;
  name: string;
  phone: string;
  position: string;
  weeklyHours?: number;
  shiftsCount?: number;
  availability?: {
    days: string[];
    preferredHours: string;
  };
}

export interface Shift {
  id: string;
  employeeName: string;
  employeeId: string;
  day: string;
  startTime: string;
  endTime: string;
  shiftType: "morning" | "evening" | "night";
}

export interface Availability {
  id: string;
  employeeId: string;
  day: string;
  preferredHours: string;
}

export interface Absence {
  id: string;
  employeeId: string;
  employeeName?: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

// Employees API
export const fetchEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase.from("employees").select("*");

  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }

  // Get shifts and availability for each employee
  const employeesWithDetails = await Promise.all(
    data.map(async (employee) => {
      // Get shifts
      const { data: shifts } = await supabase
        .from("shifts")
        .select("*")
        .eq("employee_id", employee.id);

      // Get availability
      const { data: availability } = await supabase
        .from("availability")
        .select("*")
        .eq("employee_id", employee.id);

      // Calculate weekly hours
      let weeklyHours = 0;
      if (shifts) {
        shifts.forEach((shift) => {
          const startHour = parseInt(shift.start_time.split(":")[0]);
          const endHour = parseInt(shift.end_time.split(":")[0]);
          let hours = 0;

          if (endHour > startHour) {
            hours = endHour - startHour;
          } else {
            // Handle overnight shifts
            hours = 24 - startHour + endHour;
          }

          weeklyHours += hours;
        });
      }

      // Format availability
      const availabilityDays = availability?.map((a) => a.day) || [];
      const preferredHours =
        availability && availability.length > 0
          ? availability[0].preferred_hours
          : "Flexible";

      return {
        id: employee.id,
        name: employee.name,
        phone: employee.phone || "",
        position: employee.position,
        weeklyHours,
        shiftsCount: shifts?.length || 0,
        availability: {
          days: availabilityDays,
          preferredHours,
        },
      };
    }),
  );

  return employeesWithDetails;
};

export const createEmployee = async (
  employee: Omit<Employee, "id">,
): Promise<Employee | null> => {
  // Insert employee
  const { data, error } = await supabase
    .from("employees")
    .insert({
      name: employee.name,
      phone: employee.phone,
      position: employee.position,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating employee:", error);
    return null;
  }

  // Insert availability
  if (employee.availability && employee.availability.days.length > 0) {
    const availabilityInserts = employee.availability.days.map((day) => ({
      employee_id: data.id,
      day,
      preferred_hours: employee.availability?.preferredHours || "Flexible",
    }));

    const { error: availabilityError } = await supabase
      .from("availability")
      .insert(availabilityInserts);

    if (availabilityError) {
      console.error("Error creating availability:", availabilityError);
    }
  }

  return {
    id: data.id,
    name: data.name,
    phone: data.phone || "",
    position: data.position,
    weeklyHours: 0,
    shiftsCount: 0,
    availability: employee.availability,
  };
};

export const updateEmployee = async (
  employee: Employee,
): Promise<Employee | null> => {
  // Update employee
  const { data, error } = await supabase
    .from("employees")
    .update({
      name: employee.name,
      phone: employee.phone,
      position: employee.position,
      updated_at: new Date().toISOString(),
    })
    .eq("id", employee.id)
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating employee:", error);
    return null;
  }

  // Delete existing availability
  await supabase.from("availability").delete().eq("employee_id", employee.id);

  // Insert new availability
  if (employee.availability && employee.availability.days.length > 0) {
    const availabilityInserts = employee.availability.days.map((day) => ({
      employee_id: employee.id,
      day,
      preferred_hours: employee.availability?.preferredHours || "Flexible",
    }));

    const { error: availabilityError } = await supabase
      .from("availability")
      .insert(availabilityInserts);

    if (availabilityError) {
      console.error("Error updating availability:", availabilityError);
    }
  }

  return {
    ...employee,
  };
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    console.error("Error deleting employee:", error);
    return false;
  }

  return true;
};

// Shifts API
export const fetchShifts = async (): Promise<Shift[]> => {
  const { data, error } = await supabase
    .from("shifts")
    .select("*, employees(name)");

  if (error) {
    console.error("Error fetching shifts:", error);
    return [];
  }

  return data.map((shift) => ({
    id: shift.id,
    employeeId: shift.employee_id,
    employeeName: Array.isArray(shift.employees)
      ? shift.employees[0]?.name || "Unknown"
      : shift.employees?.name || "Unknown",
    day: shift.day,
    startTime: shift.start_time,
    endTime: shift.end_time,
    shiftType: getShiftType(shift.start_time),
  }));
};

export const createShift = async (
  shift: Omit<Shift, "id">,
): Promise<Shift | null> => {
  const { data, error } = await supabase
    .from("shifts")
    .insert({
      employee_id: shift.employeeId,
      day: shift.day,
      start_time: shift.startTime,
      end_time: shift.endTime,
      shift_type: shift.shiftType,
    })
    .select("*, employees(name)")
    .single();

  if (error || !data) {
    console.error("Error creating shift:", error);
    return null;
  }

  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: Array.isArray(data.employees)
      ? data.employees[0]?.name || "Unknown"
      : data.employees?.name || "Unknown",
    day: data.day,
    startTime: data.start_time,
    endTime: data.end_time,
    shiftType: data.shift_type as "morning" | "evening" | "night",
  };
};

export const updateShift = async (shift: Shift): Promise<Shift | null> => {
  const { data, error } = await supabase
    .from("shifts")
    .update({
      employee_id: shift.employeeId,
      day: shift.day,
      start_time: shift.startTime,
      end_time: shift.endTime,
      shift_type: shift.shiftType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shift.id)
    .select("*, employees(name)")
    .single();

  if (error || !data) {
    console.error("Error updating shift:", error);
    return null;
  }

  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: Array.isArray(data.employees)
      ? data.employees[0]?.name || "Unknown"
      : data.employees?.name || "Unknown",
    day: data.day,
    startTime: data.start_time,
    endTime: data.end_time,
    shiftType: data.shift_type as "morning" | "evening" | "night",
  };
};

export const deleteShift = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("shifts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting shift:", error);
    return false;
  }

  return true;
};

// Helper functions
const getShiftType = (time: string): "morning" | "evening" | "night" => {
  const hour = parseInt(time.split(":")[0]);
  if (hour >= 11 && hour < 17) return "morning";
  if (hour >= 17 && hour < 24) return "evening";
  return "night";
};

// Absences API
export const fetchAbsences = async (): Promise<Absence[]> => {
  const { data, error } = await supabase
    .from("absences")
    .select("*, employees(name)");

  if (error) {
    console.error("Error fetching absences:", error);
    return [];
  }

  return data.map((absence) => ({
    id: absence.id,
    employeeId: absence.employee_id,
    employeeName: Array.isArray(absence.employees)
      ? absence.employees[0]?.name || "Unknown"
      : absence.employees?.name || "Unknown",
    startDate: absence.start_date,
    endDate: absence.end_date,
    reason: absence.reason,
  }));
};

export const createAbsence = async (
  absence: Omit<Absence, "id">,
): Promise<Absence | null> => {
  const { data, error } = await supabase
    .from("absences")
    .insert({
      employee_id: absence.employeeId,
      start_date: absence.startDate,
      end_date: absence.endDate,
      reason: absence.reason,
    })
    .select("*, employees(name)")
    .single();

  if (error || !data) {
    console.error("Error creating absence:", error);
    return null;
  }

  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: Array.isArray(data.employees)
      ? data.employees[0]?.name || "Unknown"
      : data.employees?.name || "Unknown",
    startDate: data.start_date,
    endDate: data.end_date,
    reason: data.reason,
  };
};

export const updateAbsence = async (
  absence: Absence,
): Promise<Absence | null> => {
  const { data, error } = await supabase
    .from("absences")
    .update({
      employee_id: absence.employeeId,
      start_date: absence.startDate,
      end_date: absence.endDate,
      reason: absence.reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", absence.id)
    .select("*, employees(name)")
    .single();

  if (error || !data) {
    console.error("Error updating absence:", error);
    return null;
  }

  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: Array.isArray(data.employees)
      ? data.employees[0]?.name || "Unknown"
      : data.employees?.name || "Unknown",
    startDate: data.start_date,
    endDate: data.end_date,
    reason: data.reason,
  };
};

export const deleteAbsence = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("absences").delete().eq("id", id);

  if (error) {
    console.error("Error deleting absence:", error);
    return false;
  }

  return true;
};
