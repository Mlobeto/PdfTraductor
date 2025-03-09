import React, { useState } from "react";
import logo from "../assets/logoseptic.png"; // Ajusta la ruta según tu estructura
import ProgressTracker from "./ProgressTracker"; // Importa los componentes necesarios
import FirstStage from "./firstStage";
// import Inbox from "./Inbox";
// import Documents from "./Documents";
// import Activity from "./Activity";

const sections = ["Overview", "Etapa1", "Inbox", "Documents", "Activity"];

const Header = ({ activeSection, setActiveSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case "Overview":
        return <ProgressTracker />;
      case "Etapa1":
        return <FirstStage />;
      // case "Inbox":
      //   return <Inbox />;
      // case "Documents":
      //   return <Documents />;
      // case "Activity":
      //   return <Activity />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="bg-blue-950 text-white p-4 flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="text-lg font-bold flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <span>ZURCHER CONSTRUCTION</span>
        </div>
        <div className="flex gap-6 mt-3 md:mt-0">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`text-sm md:text-base py-2 px-4 rounded transition-all duration-300 ${
                activeSection === section ? "bg-white text-blue-700 font-semibold" : "hover:bg-blue-900"
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        {renderSection()}
      </div>
    </div>
  );
};

export default Header;