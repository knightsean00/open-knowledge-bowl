import React, { useState } from 'react'
import { ArduinoMode } from "./App";
import { CartesianGrid, LineChart, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer, } from 'recharts';

interface AdminPageProps {
  requestArduinoMode: (newMode: ArduinoMode) => void;
  sensorData: object[];
  buzzerThresholds: number[];
  setBuzzerThreshold: (buzzerIndex: number, touchThreshold: number) => void;
}

const keyToColorMapping = {
  "0": "#BCF8EC",
  "1": "#FAD4D8",
  "2": "#C04CFD",
  "3": "#FF5714",
  "4": "#FFEC51",
}

// TODO: Allow threshold to be set
// FIRST PASS JUST SET THRESHOLD
// SECOND PASS GET ACTUAL THRESHOLD VALUES CONFIRMED FROM ARDUINO
const AdminPage: React.FC<AdminPageProps> = ({ requestArduinoMode, sensorData, buzzerThresholds, setBuzzerThreshold }) => {
  const [newBuzzerThresholds, setNewBuzzerThresholds] = useState<number[]>(buzzerThresholds.slice());

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "95vh" }}>
      <div style={{ height: "90vh", display: "flex", flexDirection: "row" }}>
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sensorData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="1 5" />
              <XAxis dataKey="time" />
              <YAxis />
              <Legend />
              {
                sensorData.length > 0 ?
                  Object.keys(sensorData[0]).map((keyName, idx) => {
                    if (keyName != "time") {
                      return (
                        <Line dataKey={keyName} stroke={keyToColorMapping[keyName]} />
                      )
                    }
                    return (<></>)
                  }) :
                  <></>
              }
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {
            newBuzzerThresholds.map((val, idx) => {
              return (
                <div>
                  <label>Buzzer {idx}</label>
                  <input value={val} key={idx} onChange={(event) => {
                    setNewBuzzerThresholds((oldThresholds) => {
                      const newThresholds = [...oldThresholds];
                      newThresholds[idx] = event.target.value.length > 0 ? parseInt(event.target.value) : 0;
                      return newThresholds;
                    })
                  }} onBlur={() => setBuzzerThreshold(idx, newBuzzerThresholds[idx])} />
                </div>
              )
            })
          }
        </div>
      </div>
      <div style={{ flex: 1 }} className="row">
        <button onClick={() => requestArduinoMode(ArduinoMode.LOG_TOUCH)}>tournament mode</button>
      </div>
    </div>
  );
}

export default AdminPage;
