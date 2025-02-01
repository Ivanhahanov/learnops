import TerminalComponent from "../components/Xterm"
import Legend from "../components/Legend"
import IDE from "../components/IDE";
import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Workspace from "../components/Workspace";

const TaskPage = () => {
  const [ratio, setRatio] = useState(55);

  return (
    <div className="flex w-full h-[calc(100vh-4em)] items-center">
      <div style={{ width: `${ratio}%` }} className="flex flex-col px-1">
        <Workspace />
      </div>
      <div
        className="w-1 h-1 bg-gray-500 cursor-col-resize rounded"
        style={{ height: "100px" }} // Увеличение высоты для лучшей видимости
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startRatio = ratio;
          
          const onMouseMove = (e) => {
            const delta = ((e.clientX - startX) / window.innerWidth) * 100;
            setRatio(Math.min(Math.max(startRatio + delta, 30), 70));
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };
          
          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      ></div>
      <div style={{ width: `${100 - ratio}%` }} className="flex flex-col px-1">
        <Legend />
      </div>
    </div>
  );
};

export default TaskPage;