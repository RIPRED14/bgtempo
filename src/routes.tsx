import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/home";
import Dashboard from "./components/Dashboard";
import CreationMode from "./components/ShiftManagement/CreationMode";
import EmployeeManagement from "./components/Admin/EmployeeManagement";
import AbsenceManagement from "./components/ShiftManagement/AbsenceManagement";
import Reports from "./components/Admin/Reports";
import EmployeeLogin from "./components/EmployeePortal/EmployeeLogin";
import EmployeeDashboard from "./components/EmployeePortal/EmployeeDashboard";
import AdminLogin from "./components/Admin/AdminLogin";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Login Routes */}
      <Route path="/" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/planning" element={<Home />} />
      <Route path="/creation" element={<CreationMode />} />
      <Route path="/employees" element={<EmployeeManagement />} />
      <Route path="/absences" element={<AbsenceManagement />} />
      <Route path="/reports" element={<Reports />} />

      {/* Employee Portal Routes */}
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

      {/* Redirect any other routes to login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
