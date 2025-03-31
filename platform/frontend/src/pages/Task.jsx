import Legend from "../components/Legend"
import React from "react";
import { useState, useEffect } from "react";
import Workspace from "../components/Workspace";
import { FiArrowLeft, FiBookOpen } from 'react-icons/fi';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const handler = (e) => setMatches(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

const TaskPage = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-4rem)]">
      {/* Mobile Legend Toggle */}
      {isMobile && (
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="fixed bottom-4 right-4 z-50 btn btn-circle btn-primary shadow-lg w-12 h-12"
          aria-label={isLegendOpen ? "Close legend" : "Open legend"}
        >
          {isLegendOpen ? <FiArrowLeft className="text-xl" /> : <FiBookOpen className="text-xl" />}
        </button>
      )}

      {/* Workspace Area */}
      <div className={`flex-1 ${isMobile ? (isLegendOpen ? 'hidden' : 'block') : ''}`}>
        <Workspace isMobile={isMobile} />
      </div>

      {/* Legend Sidebar */}
      <div className={`
        ${isMobile ? 
          `fixed inset-0 w-full transform ${isLegendOpen ? 'translate-x-0' : 'translate-x-full'} 
           transition-transform duration-300 ease-in-out z-40 pt-16 bg-base-100` : 
          'flex-1 max-w-[45%]'}
      `}>
        <Legend onClose={() => setIsLegendOpen(false)} isMobile={isMobile} />
      </div>
    </div>
  );
};

export default TaskPage;