// Types for the API

export interface Employee {
  id: string;
  name: string;
  phone: string;
  position: string;
  weeklyHours: number;
  shiftsCount: number;
  username?: string;
  code?: string;
  availability: {
    days: string[];
    preferredHours: string;
  };
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  day: string;
  startTime: string;
  endTime: string;
  shiftType: "morning" | "evening" | "night";
}

export interface Absence {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// Mock API functions
export const fetchEmployees = async (): Promise<Employee[]> => {
  // In a real app, this would fetch from an API
  // For now, we'll just return mock data from localStorage
  try {
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) {
      const employees = JSON.parse(savedEmployees);
      if (Array.isArray(employees)) {
        return employees;
      }
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
  }

  // Return default employees if none found
  return [
    {
      id: "emp-1",
      name: "John Smith",
      phone: "06 12 34 56 78",
      position: "Chef",
      weeklyHours: 38,
      shiftsCount: 5,
      username: "john",
      code: "1234",
      availability: {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        preferredHours: "Matin",
      },
    },
    {
      id: "emp-2",
      name: "Sarah Johnson",
      phone: "06 23 45 67 89",
      position: "Serveuse",
      weeklyHours: 25,
      shiftsCount: 3,
      username: "sarah",
      code: "2345",
      availability: {
        days: ["Monday", "Wednesday", "Friday", "Saturday"],
        preferredHours: "Soir",
      },
    },
    {
      id: "emp-3",
      name: "Mike Williams",
      phone: "06 34 56 78 90",
      position: "Barman",
      weeklyHours: 30,
      shiftsCount: 4,
      username: "mike",
      code: "3456",
      availability: {
        days: ["Thursday", "Friday", "Saturday", "Sunday"],
        preferredHours: "Soir",
      },
    },
    {
      id: "emp-4",
      name: "Lisa Brown",
      phone: "06 45 67 89 01",
      position: "Serveuse",
      weeklyHours: 22,
      shiftsCount: 3,
      username: "lisa",
      code: "4567",
      availability: {
        days: ["Tuesday", "Thursday", "Saturday", "Sunday"],
        preferredHours: "Matin",
      },
    },
    {
      id: "emp-5",
      name: "David Miller",
      phone: "06 56 78 90 12",
      position: "Cuisinier",
      weeklyHours: 35,
      shiftsCount: 5,
      username: "david",
      code: "5678",
      availability: {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        preferredHours: "Matin",
      },
    },
  ];
};

export const fetchShifts = async (): Promise<Shift[]> => {
  // In a real app, this would fetch from an API
  // For now, we'll just return mock data
  return [
    {
      id: "shift-1",
      employeeId: "emp-1",
      employeeName: "John Smith",
      day: "Monday",
      startTime: "11:00",
      endTime: "17:00",
      shiftType: "morning",
    },
    {
      id: "shift-2",
      employeeId: "emp-2",
      employeeName: "Sarah Johnson",
      day: "Monday",
      startTime: "17:00",
      endTime: "00:00",
      shiftType: "evening",
    },
    {
      id: "shift-3",
      employeeId: "emp-3",
      employeeName: "Mike Williams",
      day: "Tuesday",
      startTime: "11:00",
      endTime: "17:00",
      shiftType: "morning",
    },
    {
      id: "shift-4",
      employeeId: "emp-4",
      employeeName: "Lisa Brown",
      day: "Friday",
      startTime: "00:00",
      endTime: "07:00",
      shiftType: "night",
    },
    {
      id: "shift-5",
      employeeId: "emp-5",
      employeeName: "David Miller",
      day: "Wednesday",
      startTime: "17:00",
      endTime: "00:00",
      shiftType: "evening",
    },
  ];
};

export const fetchAbsences = async (): Promise<Absence[]> => {
  // In a real app, this would fetch from an API
  // For now, we'll try to get from localStorage first
  try {
    const savedRequests = localStorage.getItem("absenceRequests");
    if (savedRequests) {
      const requests = JSON.parse(savedRequests);
      if (Array.isArray(requests)) {
        return requests;
      }
    }
  } catch (error) {
    console.error("Error fetching absences:", error);
  }

  // Return default absences if none found
  return [
    {
      id: "absence-1",
      employeeId: "emp-3",
      employeeName: "Mike Williams",
      startDate: "2023-05-15",
      endDate: "2023-05-16",
      reason: "Rendez-vous médical",
      status: "approved",
      createdAt: "2023-05-10T10:30:00Z",
    },
    {
      id: "absence-2",
      employeeId: "emp-2",
      employeeName: "Sarah Johnson",
      startDate: "2023-05-20",
      endDate: "2023-05-22",
      reason: "Raisons personnelles",
      status: "pending",
      createdAt: "2023-05-12T14:15:00Z",
    },
    {
      id: "absence-3",
      employeeId: "emp-4",
      employeeName: "Lisa Brown",
      startDate: "2023-05-18",
      endDate: "2023-05-18",
      reason: "Rendez-vous administratif",
      status: "rejected",
      createdAt: "2023-05-11T09:45:00Z",
    },
  ];
};

export const createAbsence = async (
  absence: Omit<Absence, "id" | "status" | "createdAt">,
): Promise<Absence | null> => {
  try {
    // Generate a unique ID
    const id = `absence-${Date.now()}`;
    const now = new Date().toISOString();

    // Create the new absence
    const newAbsence: Absence = {
      ...absence,
      id,
      status: "pending",
      createdAt: now,
    };

    // Save to localStorage
    const savedRequests = localStorage.getItem("absenceRequests") || "[]";
    const requests = JSON.parse(savedRequests);
    requests.push(newAbsence);
    localStorage.setItem("absenceRequests", JSON.stringify(requests));

    return newAbsence;
  } catch (error) {
    console.error("Error creating absence:", error);
    return null;
  }
};

export const updateAbsence = async (
  absence: Partial<Absence> & { id: string },
): Promise<Absence | null> => {
  try {
    // Get current absences
    const savedRequests = localStorage.getItem("absenceRequests") || "[]";
    const requests = JSON.parse(savedRequests);

    // Find the absence to update
    const index = requests.findIndex((a: Absence) => a.id === absence.id);
    if (index === -1) return null;

    // Update the absence
    const updatedAbsence = { ...requests[index], ...absence };
    requests[index] = updatedAbsence;

    // Save back to localStorage
    localStorage.setItem("absenceRequests", JSON.stringify(requests));

    return updatedAbsence;
  } catch (error) {
    console.error("Error updating absence:", error);
    return null;
  }
};

export const deleteAbsence = async (id: string): Promise<boolean> => {
  try {
    // Get current absences
    const savedRequests = localStorage.getItem("absenceRequests") || "[]";
    const requests = JSON.parse(savedRequests);

    // Filter out the absence to delete
    const filteredRequests = requests.filter((a: Absence) => a.id !== id);

    // Save back to localStorage
    localStorage.setItem("absenceRequests", JSON.stringify(filteredRequests));

    return true;
  } catch (error) {
    console.error("Error deleting absence:", error);
    return false;
  }
};
