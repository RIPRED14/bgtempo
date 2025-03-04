import { Shift } from "./api";

interface WeekInfo {
  start: string;
  end: string;
  formattedRange: string;
}

export class WeekStorage {
  // Get all stored weeks
  static getAllStoredWeeks(): WeekInfo[] {
    try {
      // Get all localStorage keys
      const keys = Object.keys(localStorage);

      // Filter keys that match the shifts_start_end pattern
      const weekKeys = keys.filter((key) => key.startsWith("shifts_"));

      // Extract week info from keys
      const weeks: WeekInfo[] = weekKeys.map((key) => {
        const [_, start, end] = key.split("_");
        return {
          start,
          end,
          formattedRange: this.formatDateRange(new Date(start), new Date(end)),
        };
      });

      // Sort weeks by start date (newest first)
      return weeks.sort((a, b) => {
        return new Date(b.start).getTime() - new Date(a.start).getTime();
      });
    } catch (error) {
      console.error("Error getting stored weeks:", error);
      return [];
    }
  }

  // Save shifts for a specific week
  static saveShiftsForWeek(
    start: string,
    end: string,
    shifts: Shift[],
  ): boolean {
    try {
      const weekKey = `shifts_${start}_${end}`;
      localStorage.setItem(weekKey, JSON.stringify(shifts));
      return true;
    } catch (error) {
      console.error("Error saving shifts for week:", error);
      return false;
    }
  }

  // Get shifts for a specific week
  static getShiftsForWeek(start: string, end: string): Shift[] | null {
    try {
      const weekKey = `shifts_${start}_${end}`;
      const storedShifts = localStorage.getItem(weekKey);

      if (storedShifts) {
        return JSON.parse(storedShifts);
      }

      return null;
    } catch (error) {
      console.error("Error getting shifts for week:", error);
      return null;
    }
  }

  // Format date range for display
  private static formatDateRange(start: Date, end: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
    };
    const startStr = start.toLocaleDateString("fr-FR", options);
    const endStr = end.toLocaleDateString("fr-FR", options);
    const year = end.getFullYear();

    return `${startStr} - ${endStr}, ${year}`;
  }
}
