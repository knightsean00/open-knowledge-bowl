import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import BuzzerPage from './BuzzerPage';
import AdminPage from './AdminPage';
import { input } from 'motion/react-client';

export enum ArduinoMode {
  LOG_TOUCH,
  LOG_SENSOR,
  UNKNOWN
}

const teamNumberToName = (teamIndex: number) => {
  return `Team ${teamIndex + 1}`;
}

// Main App that renders the correct page based on the mode (taken from serial)
//    TouchSensor Page
//    SensorValues Page (dev page, can also send commands here)

const encoder = new TextEncoder();

const buzzerAudio = new Audio("/buzzer.mp3");

function App() {
  const [teamQueue, setTeamQueue] = useState<string[]>([]);
  const [sensorData, setSensorData] = useState<object[]>([]);
  const [buzzerThresholds, setBuzzerThresholds] = useState<number[]>([]);
  const [arduinoMode, setArduinoMode] = useState<ArduinoMode>(ArduinoMode.LOG_TOUCH);

  const [port, setPort] = useState(null);
  const [reader, setReader] = useState(null);
  const [writer, setWriter] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const latestArduinoMode = useRef(arduinoMode);
  const latestSensorData = useRef(sensorData);

  useEffect(() => {
    latestArduinoMode.current = arduinoMode;

    switch (arduinoMode) {
      case ArduinoMode.LOG_SENSOR:
        setTeamQueue([]);
        break;
      case ArduinoMode.LOG_TOUCH:
        break;
    }
  }, [arduinoMode]);

  const sendSerial = async (text: string) => {
    if (writer != null) {
      await writer.write(encoder.encode(text + "\n"));
    } else {
      console.error("WRITER IS NULL, CANNOT WRITE DATA")
    }
  }

  const requestArduinoMode = async (requestedMode: ArduinoMode) => {
    switch (requestedMode) {
      case ArduinoMode.LOG_SENSOR:
        await sendSerial("MODE:LOG_SENSOR");
        break;
      case ArduinoMode.LOG_TOUCH:
        await sendSerial("MODE:LOG_TOUCH");
        break;
      default:
        console.error("UNKNOWN MODE TO SEND");
        break;
    }
  }

  const setNewThreshold = async (buzzerIdx: number, threshold: number) => {
    if (buzzerIdx < 0 || threshold < 0) {
      console.error("CANNOT SEND THRESHOLD WITH INDEX BELOW 0 OR THRESHOLD BELOW 0");
    } else {
      await sendSerial(`THRESHOLD:${buzzerIdx},${threshold}`);
    }
  }

  const connectToSerial = async () => {
    try {
      await navigator.serial.requestPort();
      let ports = await navigator.serial.getPorts();
      ports = ports.filter((port) => port.connected);
      if (ports.length != 1) {
        alert(`Found ${ports.length} ports to read. Cannot decide.`);
        return;
      }
      const port = ports[0]
      await port.open({ baudRate: 9600 }); // Or your baud rate
      setPort(port);
      setIsConnected(true);

      const reader = port.readable.getReader();
      setReader(reader);
      const writer = port.writable.getWriter();
      setWriter(writer);

      // Start reading loop
      readLoop(reader);

    } catch (error) {
      console.error("Error opening serial port:", error);
    }
  };

  const handleSerialRead = (inputString: string) => {
    if (inputString.startsWith("MODE:")) {
      switch (inputString) {
        case "MODE:LOG_TOUCH":
          setArduinoMode(ArduinoMode.LOG_TOUCH);
          break;
        case "MODE:LOG_SENSOR":
          setArduinoMode(ArduinoMode.LOG_SENSOR);
          break;
        default:
          setArduinoMode(ArduinoMode.UNKNOWN);
          break;
      }
    }
    else if (inputString.startsWith("THRESHOLD:")) {
      const thresholdSplit = inputString.split(":").join(",").split(",");
      if (thresholdSplit.length != 3) {
        return;
      }
      const buzzerIdx = parseInt(thresholdSplit[1]);
      const threshold = parseInt(thresholdSplit[2]);

      if (buzzerIdx < 0 || threshold < 0) {
        return;
      }

      setBuzzerThresholds((oldThreshold) => {
        const newThresholds = [...oldThreshold];

        // This could be more efficient
        while (newThresholds.length <= buzzerIdx) {
          newThresholds.push(0);
        }

        newThresholds[buzzerIdx] = threshold;
        return newThresholds;
      });
    }
    else if (inputString.startsWith("ERROR:")) {
      console.error(inputString);
    }
    else if (latestArduinoMode.current === ArduinoMode.LOG_TOUCH) {
      const buzzedTeams = inputString.split(";")
      // console.log(buzzedTeams);
      for (const team of buzzedTeams) {
        // Could choose from the buzzed teams randomly?
        if (team.length > 0) {
          const teamName = teamNumberToName(parseInt(team));
          setTeamQueue((oldQueue) => {
            if (oldQueue.includes(teamName)) {
              return oldQueue;
            }
            buzzerAudio.play();
            return [...oldQueue, teamName];
          });
        }
      }
    } else if (latestArduinoMode.current === ArduinoMode.LOG_SENSOR) {
      const buzzerData = inputString.split(";").reduce((obj, value, idx) => {
        if (value.length > 0) {
          obj[idx.toString()] = parseInt(value);
        }
        return obj;
      }, {});
      const currentTime = Date.now();
      buzzerData["time"] = currentTime;

      latestSensorData.current.push(buzzerData);

      if (latestSensorData.current.length > 500) {
        latestSensorData.current.shift();
      }

      if (latestSensorData.current.length > 0 && currentTime - latestSensorData.current[0]["time"] > 50) {
        setSensorData([...latestSensorData.current]);
      }
    }
  }

  const readLoop = async (reader) => {
    let partialMessage = "";
    const terminator = "\n"
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // Reader is done
          break;
        }

        const decoder = new TextDecoder(); // Decode the Uint8Array to text
        const chunk = decoder.decode(value);
        partialMessage += chunk;

        let terminatorIndex;
        while ((terminatorIndex = partialMessage.indexOf(terminator)) !== -1) {
          const completeMessage = partialMessage.substring(0, terminatorIndex);
          // console.log(completeMessage);
          handleSerialRead(completeMessage.trim());

          partialMessage = partialMessage.substring(terminatorIndex + terminator.length);
        }
      }
    } catch (error) {
      console.error("Error reading from serial port:", error);
    } finally {
      if (reader) {
        reader.releaseLock(); // Release the lock when done
      }
      if (port) {
        await port.close(); // Close the port
        setPort(null);
        setIsConnected(false);
      }
    }
  };

  const disconnectFromSerial = async () => {
    if (reader) {
      await reader.cancel();  // Stop the reader
    }

    if (writer) {
      await writer.cancel();
    }

    if (port) {
      await port.close();
      setPort(null);
      setIsConnected(false);
    }
  };


  useEffect(() => {
    // Clean up on unmount (important!)
    return () => {
      if (port) {
        disconnectFromSerial();
      }
    };
  }, [port, reader, writer]);


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

  if (!isConnected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "95vh" }}>
        <div style={{ flex: 1 }} className="row">
          <button className="big" onClick={connectToSerial}>Connect to Serial</button>
        </div>
      </div>
    )
  }

  switch (arduinoMode) {
    case ArduinoMode.LOG_TOUCH:
      return (<BuzzerPage teamQueue={teamQueue} requestArduinoMode={requestArduinoMode} />);
    case ArduinoMode.LOG_SENSOR:
      return (<AdminPage requestArduinoMode={requestArduinoMode} sensorData={sensorData} buzzerThresholds={buzzerThresholds} setBuzzerThreshold={setNewThreshold} />);
    default:
      return (<h1>WARNING: ARDUINO IN UNKNOWN MODE</h1>)
  }

}

export default App;
