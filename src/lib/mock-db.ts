import { Employee, Shift, Absence } from "./api";

/**
 * This is a simple mock database service that stores data in memory
 * It's used as a fallback when the real database connection fails
 */
export class MockDatabase {
  private static employees: Employee[] = [];
  private static availability: {
    employeeId: string;
    days: string[];
    preferredHours: string;
  }[] = [];

  // Employee methods
  static getEmployees(): Employee[] {
    return this.employees;
  }

  static saveEmployees(employees: Employee[]): boolean {
    try {
      this.employees = [...employees];
      console.log(`[MockDB] Saved ${employees.length} employees`);
      return true;
    } catch (error) {
      console.error("[MockDB] Error saving employees:", error);
      return false;
    }
  }

  // Availability methods
  static getAvailability(employeeId: string): {
    days: string[];
    preferredHours: string;
  } {
    const availability = this.availability.find(
      (a) => a.employeeId === employeeId,
    );
    return availability || { days: [], preferredHours: "Flexible" };
  }

  static saveAvailability(
    employeeId: string,
    days: string[],
    preferredHours: string,
  ): boolean {
    try {
      // Remove existing availability for this employee
      this.availability = this.availability.filter(
        (a) => a.employeeId !== employeeId,
      );

      // Add new availability
      this.availability.push({ employeeId, days, preferredHours });
      console.log(`[MockDB] Saved availability for employee ${employeeId}`);
      return true;
    } catch (error) {
      console.error("[MockDB] Error saving availability:", error);
      return false;
    }
  }

  // Delete employee and related data
  static deleteEmployee(employeeId: string): boolean {
    try {
      // Check if employee exists before deleting
      const employeeExists = this.employees.some((e) => e.id === employeeId);
      if (!employeeExists) {
        console.error(`[MockDB] Employee ${employeeId} not found for deletion`);
        return false;
      }

      // Delete employee
      const initialCount = this.employees.length;
      this.employees = this.employees.filter((e) => e.id !== employeeId);

      // Verify deletion was successful
      if (this.employees.length === initialCount) {
        console.error(`[MockDB] Failed to delete employee ${employeeId}`);
        return false;
      }

      // Delete related availability data
      this.availability = this.availability.filter(
        (a) => a.employeeId !== employeeId,
      );

      console.log(`[MockDB] Deleted employee ${employeeId} and related data`);
      return true;
    } catch (error) {
      console.error("[MockDB] Error deleting employee:", error);
      return false;
    }
  }

  // Clear all data
  static clearAll(): void {
    this.employees = [];
    this.availability = [];
    console.log("[MockDB] All data cleared");
  }
}
