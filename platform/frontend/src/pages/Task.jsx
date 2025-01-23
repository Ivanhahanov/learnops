import TerminalComponent from "../components/Xterm"
import Legend from "../components/Legend"
import IDE from "../components/IDE";
import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Workspace from "../components/Workspace";


const TaskPage = () => {
  return (
    <div className="flex pt-2">
      <div className="w-7/12 mx-auto px-1 pl-2">
        <Workspace />
      </div>
      <div className="w-5/12 mx-auto px-1 pr-2">
        <Legend />
      </div>
    </div>
  );
}


export default TaskPage