import { useState, useEffect } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import BuzzerPage from './BuzzerPage';
import AdminPage from './AdminPage';

export enum ArduinoMode {
  LOG_TOUCH,
  LOG_SENSOR,
  UNKNOWN
}

// Main App that renders the correct page based on the mode (taken from serial)
//    TouchSensor Page
//    SensorValues Page (dev page, can also send commands here)

function App() {
  const [teamQueue, setTeamQueue] = useState<string[]>([]);
  const [arduinoMode, setArduinoMode] = useState<ArduinoMode>(ArduinoMode.LOG_TOUCH);

  useEffect(() => {
    const handleGlobalKeyDown = (event: { key: string; }) => {
      if (event.key === 'Enter') {
        setTeamQueue((oldQueue) => [...oldQueue, `Team ${oldQueue.length + 1}`]);
      }
      else if (event.key === "Delete") {
        setTeamQueue([]);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // console.log(teamQueue);


  switch (arduinoMode) {
    case ArduinoMode.LOG_TOUCH:
      return (<BuzzerPage teamQueue={teamQueue} setArduinoMode={setArduinoMode} />);
    case ArduinoMode.LOG_SENSOR:
      return (<AdminPage setArduinoMode={setArduinoMode}/>);
    default:
      return (<h1>WARNING: ARDUINO IN UNKNOWN MODE</h1>)
  }

}

export default App
