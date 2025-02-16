import React, { useState } from 'react'
import { ArduinoMode } from "./App";

interface AdminPageProps {
  setArduinoMode: (newMode: ArduinoMode) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ setArduinoMode }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "95vh" }}>
      <div style={{ flex: 1 }} className="row">
        <button onClick={() => setArduinoMode(ArduinoMode.LOG_TOUCH)}>tournament mode</button>
      </div>
    </div>
  );
}

export default AdminPage;
