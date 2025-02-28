import React from "react";
import { Sidebar } from "@/components/Admin/Sidebar";
import Header from "./Header";
import FilterBar from "./FilterBar";
import WeeklyCalendar from "./WeeklyCalendar";
import EmployeeList from "./EmployeeList";
// DndProvider is now in App.tsx
// import { DndProvider } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";

interface PlanningLayoutProps {
  children?: React.ReactNode;
}

const PlanningLayout: React.FC<PlanningLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
};

export default PlanningLayout;
