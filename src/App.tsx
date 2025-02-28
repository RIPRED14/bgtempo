import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Dashboard from "./components/Admin/Dashboard";
import EmployeeManagement from "./components/Admin/EmployeeManagement";
import AbsenceManagement from "./components/ShiftManagement/AbsenceManagement";
import Reports from "./components/Admin/Reports";
import routes from "tempo-routes";
import { Toaster } from "./components/ui/toaster";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Suspense fallback={<p>Loading...</p>}>
        <div>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planning" element={<Home />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/absences" element={<AbsenceManagement />} />
            <Route path="/reports" element={<Reports />} />
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
          </Routes>
          <Toaster />
        </div>
      </Suspense>
    </DndProvider>
  );
}

export default App;
