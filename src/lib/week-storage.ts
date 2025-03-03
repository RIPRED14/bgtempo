import { Shift } from "./api";

/**
 * Service for storing and retrieving shifts by week
 * This allows the application to maintain separate shift data for different weeks
 */
export class WeekStorage {
  /**
   * Save shifts for a specific week
   */
  static saveShiftsForWeek(
    weekStart: string,
    weekEnd: string,
    shifts: Shift[],
  ): boolean {
    try {
      const weekKey = `shifts_${weekStart}_${weekEnd}`;
      localStorage.setItem(weekKey, JSON.stringify(shifts));
      console.log(
        `Saved ${shifts.length} shifts for week ${weekStart} to ${weekEnd}`,
      );

      // Also save this week to the list of available weeks if it's not already there
      this.addWeekToStoredWeeks(weekStart, weekEnd);

      return true;
    } catch (error) {
      console.error("Error saving shifts for week:", error);
      return false;
    }
  }

  /**
   * Add a week to the list of stored weeks if it doesn't exist
   */
  private static addWeekToStoredWeeks(
    weekStart: string,
    weekEnd: string,
  ): void {
    try {
      // Get the current list of weeks
      const storedWeeks = this.getAllStoredWeeks();

      // Check if this week already exists
      const weekExists = storedWeeks.some(
        (week) => week.start === weekStart && week.end === weekEnd,
      );

      // If it doesn't exist, add it
      if (!weekExists) {
        const formattedRange = this.formatDateRange(
          new Date(weekStart),
          new Date(weekEnd),
        );

        // Add to the beginning of the array (newest first)
        storedWeeks.unshift({ start: weekStart, end: weekEnd, formattedRange });

        // Save the updated list
        localStorage.setItem("stored_weeks", JSON.stringify(storedWeeks));
        console.log(
          `Added week ${weekStart} to ${weekEnd} to stored weeks list`,
        );
      }
    } catch (error) {
      console.error("Error adding week to stored weeks:", error);
    }
  }

  /**
   * Get shifts for a specific week
   */
  static getShiftsForWeek(weekStart: string, weekEnd: string): Shift[] | null {
    try {
      const weekKey = `shifts_${weekStart}_${weekEnd}`;
      const savedShifts = localStorage.getItem(weekKey);
      if (savedShifts) {
        const parsedShifts = JSON.parse(savedShifts);
        if (Array.isArray(parsedShifts)) {
          console.log(
            `Loaded ${parsedShifts.length} shifts for week ${weekStart} to ${weekEnd}`,
          );
          return parsedShifts;
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading shifts for week:", error);
      return null;
    }
  }

  /**
   * Copy shifts from one week to another
   */
  static copyShiftsToWeek(
    sourceStart: string,
    sourceEnd: string,
    targetStart: string,
    targetEnd: string,
  ): boolean {
    try {
      // Get shifts from source week
      const shifts = this.getShiftsForWeek(sourceStart, sourceEnd);
      if (!shifts) {
        console.error(
          `No shifts found for source week ${sourceStart} to ${sourceEnd}`,
        );
        return false;
      }

      // Save shifts to target week
      return this.saveShiftsForWeek(targetStart, targetEnd, shifts);
    } catch (error) {
      console.error("Error copying shifts to week:", error);
      return false;
    }
  }

  /**
   * Get all stored weeks
   */
  static getAllStoredWeeks(): {
    start: string;
    end: string;
    formattedRange: string;
  }[] {
    try {
      // First check if we have a stored list of weeks
      const storedWeeksList = localStorage.getItem("stored_weeks");
      if (storedWeeksList) {
        try {
          const parsedWeeks = JSON.parse(storedWeeksList);
          if (Array.isArray(parsedWeeks) && parsedWeeks.length > 0) {
            return parsedWeeks;
          }
        } catch (parseError) {
          console.error("Error parsing stored weeks list:", parseError);
        }
      }

      // Fallback: Scan localStorage for week keys
      const weeks: { start: string; end: string; formattedRange: string }[] =
        [];

      // Iterate through localStorage to find all week keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("shifts_")) {
          const [, start, end] = key.split("_");
          if (start && end) {
            // Format the date range for display
            const formattedRange = this.formatDateRange(
              new Date(start),
              new Date(end),
            );
            weeks.push({ start, end, formattedRange });
          }
        }
      }

      // Sort weeks by start date (newest first)
      weeks.sort(
        (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
      );

      // Save this list for future use
      localStorage.setItem("stored_weeks", JSON.stringify(weeks));

      return weeks;
    } catch (error) {
      console.error("Error getting all stored weeks:", error);
      return [];
    }
  }

  /**
   * Format date range for display
   */
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

  /**
   * Clear all stored weeks
   */
  static clearAllWeeks(): boolean {
    try {
      // Find all week keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("shifts_")) {
          keysToRemove.push(key);
        }
      }

      // Remove all week keys
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} stored weeks`);
      return true;
    } catch (error) {
      console.error("Error clearing all weeks:", error);
      return false;
    }
  }
}
