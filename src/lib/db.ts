import { supabase } from "./supabase";
import { Database } from "@/types/supabase";

export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type Shift = Database["public"]["Tables"]["shifts"]["Row"];

// Employee functions
export async function getEmployees() {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }

  return data || [];
}

export async function getEmployeeById(id: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching employee:", error);
    return null;
  }

  return data;
}

export async function createEmployee(
  employee: Omit<Employee, "id" | "created_at">,
) {
  const { data, error } = await supabase
    .from("employees")
    .insert(employee)
    .select()
    .single();

  if (error) {
    console.error("Error creating employee:", error);
    return null;
  }

  return data;
}

export async function updateEmployee(
  id: string,
  updates: Partial<Omit<Employee, "id" | "created_at">>,
) {
  const { data, error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating employee:", error);
    return null;
  }

  return data;
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    console.error("Error deleting employee:", error);
    return false;
  }

  return true;
}

// Shift functions
export async function getShifts(weekStart?: string, weekEnd?: string) {
  let query = supabase.from("shifts").select("*, employees(name)");

  if (weekStart && weekEnd) {
    query = query.gte("day", weekStart).lte("day", weekEnd);
  }

  const { data, error } = await query.order("day");

  if (error) {
    console.error("Error fetching shifts:", error);
    return [];
  }

  return data || [];
}

export async function getShiftById(id: string) {
  const { data, error } = await supabase
    .from("shifts")
    .select("*, employees(name)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching shift:", error);
    return null;
  }

  return data;
}

export async function createShift(shift: Omit<Shift, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("shifts")
    .insert(shift)
    .select()
    .single();

  if (error) {
    console.error("Error creating shift:", error);
    return null;
  }

  return data;
}

export async function updateShift(
  id: string,
  updates: Partial<Omit<Shift, "id" | "created_at">>,
) {
  const { data, error } = await supabase
    .from("shifts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating shift:", error);
    return null;
  }

  return data;
}

export async function deleteShift(id: string) {
  const { error } = await supabase.from("shifts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting shift:", error);
    return false;
  }

  return true;
}

// Statistics functions
export async function getEmployeeStats(weekStart?: string, weekEnd?: string) {
  let query = supabase
    .from("shifts")
    .select("employee_id, employees(name), start_time, end_time, shift_type");

  if (weekStart && weekEnd) {
    query = query.gte("day", weekStart).lte("day", weekEnd);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching employee stats:", error);
    return {
      employeeHours: {},
      shiftsByType: { morning: 0, evening: 0, night: 0 },
    };
  }

  const employeeHours: Record<string, number> = {};
  let morningShifts = 0;
  let eveningShifts = 0;
  let nightShifts = 0;

  data?.forEach((shift) => {
    // Calculate hours for this shift
    const startHour = parseInt(shift.start_time.split(":")[0]);
    const endHour = parseInt(shift.end_time.split(":")[0]);
    let hours = 0;

    if (endHour > startHour) {
      hours = endHour - startHour;
    } else {
      // Handle overnight shifts
      hours = 24 - startHour + endHour;
    }

    // Add hours to employee total
    const employeeName = shift.employees?.name || "Unknown";
    if (employeeHours[employeeName]) {
      employeeHours[employeeName] += hours;
    } else {
      employeeHours[employeeName] = hours;
    }

    // Count shift types
    if (shift.shift_type === "morning") morningShifts++;
    if (shift.shift_type === "evening") eveningShifts++;
    if (shift.shift_type === "night") nightShifts++;
  });

  return {
    employeeHours,
    shiftsByType: {
      morning: morningShifts,
      evening: eveningShifts,
      night: nightShifts,
    },
  };
}

// Helper functions
export function getWeekDates(date = new Date()) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
    formattedRange: formatDateRange(monday, sunday),
  };
}

export function formatDateRange(start: Date, end: Date) {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const startStr = start.toLocaleDateString("fr-FR", options);
  const endStr = end.toLocaleDateString("fr-FR", options);
  const year = end.getFullYear();

  return `${startStr} - ${endStr}, ${year}`;
}

export function getAdjacentWeek(
  currentStart: string,
  direction: "next" | "prev",
) {
  const startDate = new Date(currentStart);
  const daysToAdd = direction === "next" ? 7 : -7;
  startDate.setDate(startDate.getDate() + daysToAdd);

  return getWeekDates(startDate);
}
