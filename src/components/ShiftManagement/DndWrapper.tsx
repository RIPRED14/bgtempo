import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface DndWrapperProps {
  children: React.ReactNode;
}

const DndWrapper: React.FC<DndWrapperProps> = ({ children }) => {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
};

export default DndWrapper;
