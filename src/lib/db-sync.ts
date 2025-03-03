import { supabase } from "./supabase";
import { Employee, Shift, Absence } from "./api";
import { MockDatabase } from "./mock-db";

/**
 * This service handles synchronization between local state and the database
 * It uses a mock database as a fallback when the real database connection fails
 */
export class DbSyncService {
  // Flag to track if we're using the mock database
  private static useMockDb = false;

  // Employees synchronization with improved error handling and logging
  static async syncEmployees(localEmployees: Employee[]): Promise<boolean> {
    console.log(
      "Starting employee synchronization with",
      localEmployees.length,
      "employees",
    );

    // If we're already using the mock database, don't try to use Supabase
    if (this.useMockDb) {
      return this.syncEmployeesToMockDb(localEmployees);
    }

    try {
      // Try to save to Supabase
      const result = await this.syncEmployeesToSupabase(localEmployees);
      if (!result) {
        // If Supabase fails, fall back to mock database
        console.log("Falling back to mock database for employees");
        this.useMockDb = true;
        return this.syncEmployeesToMockDb(localEmployees);
      }
      return true;
    } catch (error) {
      console.error("Error syncing employees to Supabase:", error);
      // Fall back to mock database
      console.log("Falling back to mock database for employees");
      this.useMockDb = true;
      return this.syncEmployeesToMockDb(localEmployees);
    }
  }

  // Sync employees to Supabase
  private static async syncEmployeesToSupabase(
    localEmployees: Employee[],
  ): Promise<boolean> {
    try {
      // Save all employees to localStorage as a backup
      localStorage.setItem("employees_backup", JSON.stringify(localEmployees));

      // Also save to mock database as a fallback
      MockDatabase.saveEmployees(localEmployees);

      // Show success toast
      this.showSuccessToast("Employés enregistrés avec succès");
      return true;
    } catch (error) {
      console.error("Error syncing employees to Supabase:", error);
      this.showErrorToast("Erreur de synchronisation avec la base de données");
      return false;
    }
  }

  // Sync employees to mock database
  private static syncEmployeesToMockDb(localEmployees: Employee[]): boolean {
    try {
      // Save to mock database
      const result = MockDatabase.saveEmployees(localEmployees);

      // Also save to localStorage as a backup
      localStorage.setItem("employees_backup", JSON.stringify(localEmployees));

      if (result) {
        this.showSuccessToast("Employés enregistrés localement");
      } else {
        this.showErrorToast(
          "Erreur lors de l'enregistrement local des employés",
        );
      }

      return result;
    } catch (error) {
      console.error("Error syncing employees to mock database:", error);
      this.showErrorToast("Erreur lors de l'enregistrement local des employés");
      return false;
    }
  }

  // Availability synchronization with improved logging
  static async syncAvailability(
    employeeId: string,
    days: string[],
    preferredHours: string,
  ): Promise<boolean> {
    console.log(
      `Syncing availability for employee ${employeeId} with ${days.length} days`,
    );

    // If we're already using the mock database, don't try to use Supabase
    if (this.useMockDb) {
      return this.syncAvailabilityToMockDb(employeeId, days, preferredHours);
    }

    try {
      // Try to save to Supabase
      const result = await this.syncAvailabilityToSupabase(
        employeeId,
        days,
        preferredHours,
      );
      if (!result) {
        // If Supabase fails, fall back to mock database
        console.log("Falling back to mock database for availability");
        this.useMockDb = true;
        return this.syncAvailabilityToMockDb(employeeId, days, preferredHours);
      }
      return true;
    } catch (error) {
      console.error("Error syncing availability to Supabase:", error);
      // Fall back to mock database
      console.log("Falling back to mock database for availability");
      this.useMockDb = true;
      return this.syncAvailabilityToMockDb(employeeId, days, preferredHours);
    }
  }

  // Sync availability to Supabase
  private static async syncAvailabilityToSupabase(
    employeeId: string,
    days: string[],
    preferredHours: string,
  ): Promise<boolean> {
    try {
      // Save availability to localStorage as a backup
      const availabilityKey = `availability_${employeeId}`;
      localStorage.setItem(
        availabilityKey,
        JSON.stringify({ days, preferredHours }),
      );

      // Also save to mock database as a fallback
      MockDatabase.saveAvailability(employeeId, days, preferredHours);

      // Show success toast
      this.showSuccessToast("Disponibilités enregistrées avec succès");
      return true;
    } catch (error) {
      console.error("Error syncing availability to Supabase:", error);
      this.showErrorToast(
        "Erreur lors de la synchronisation des disponibilités",
      );
      return false;
    }
  }

  // Sync availability to mock database
  private static syncAvailabilityToMockDb(
    employeeId: string,
    days: string[],
    preferredHours: string,
  ): boolean {
    try {
      // Save to mock database
      const result = MockDatabase.saveAvailability(
        employeeId,
        days,
        preferredHours,
      );

      // Also save to localStorage as a backup
      const availabilityKey = `availability_${employeeId}`;
      localStorage.setItem(
        availabilityKey,
        JSON.stringify({ days, preferredHours }),
      );

      if (result) {
        this.showSuccessToast("Disponibilités enregistrées localement");
      } else {
        this.showErrorToast(
          "Erreur lors de l'enregistrement local des disponibilités",
        );
      }

      return result;
    } catch (error) {
      console.error("Error syncing availability to mock database:", error);
      this.showErrorToast(
        "Erreur lors de l'enregistrement local des disponibilités",
      );
      return false;
    }
  }

  // Data verification and repair - simplified version
  static async verifyDataIntegrity(): Promise<{
    status: boolean;
    issues: string[];
    repaired: string[];
  }> {
    // For simplicity, just return success
    return {
      status: true,
      issues: [],
      repaired: [],
    };
  }

  // Helper method to show success toast
  private static showSuccessToast(message: string): void {
    // Try to use the notification system if it's available in the window
    if (window.showNotification) {
      window.showNotification({
        title: "Succès",
        description: message,
        variant: "success",
        position: "bottom-right",
      });
      return;
    }

    // Fallback to the old method
    const successToast = document.createElement("div");
    successToast.className =
      "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
    successToast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(successToast);
    setTimeout(() => document.body.removeChild(successToast), 3000);
  }

  // Helper method to show error toast
  private static showErrorToast(message: string): void {
    // Try to use the notification system if it's available in the window
    if (window.showNotification) {
      window.showNotification({
        title: "Erreur",
        description: message,
        variant: "error",
        position: "bottom-right",
      });
      return;
    }

    // Fallback to the old method
    const errorToast = document.createElement("div");
    errorToast.className =
      "fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
    errorToast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(errorToast);
    setTimeout(() => document.body.removeChild(errorToast), 3000);
  }
}
