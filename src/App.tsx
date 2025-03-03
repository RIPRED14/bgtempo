import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import Dashboard from "./components/Admin/Dashboard";
import EmployeeManagement from "./components/Admin/EmployeeManagement";
import AbsenceManagement from "./components/ShiftManagement/AbsenceManagement";
import Reports from "./components/Admin/Reports";
import routes from "tempo-routes";
import { Toaster } from "./components/ui/toaster";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AppRoutes from "./routes";

function App() {
  // Debug information to help troubleshoot routing issues
  console.log("App rendering, environment:", import.meta.env.MODE);
  console.log("Current path:", window.location.pathname);

  return (
    <DndProvider backend={HTML5Backend}>
      <Suspense fallback={<p>Loading...</p>}>
        <div>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <AppRoutes />
          <Toaster />
        </div>
      </Suspense>
    </DndProvider>
  );
}

export default App;
