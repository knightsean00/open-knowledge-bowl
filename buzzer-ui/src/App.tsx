import { useState, useEffect, useRef } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import BuzzerPage from "./BuzzerPage";
import AdminPage from "./AdminPage";
import { input } from "motion/react-client";
import buzzer from "/buzzer.mp3";
import useSound from "use-sound";

const teamNumberToName = (teamIndex: number) => {
  return `Team ${teamIndex + 1}`;
};

// Main App that renders the correct page based on the mode (taken from serial)
//    TouchSensor Page
//    SensorValues Page (dev page, can also send commands here)

const encoder = new TextEncoder();

function App() {
  const [teamQueue, setTeamQueue] = useState<string[]>([]);

  const [port, setPort] = useState(null);
  const [reader, setReader] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [buzzerPlay] = useSound(buzzer);

  useEffect(() => {
    if (teamQueue.length > 0) {
      buzzerPlay();
    }
  }, [teamQueue]);

  const connectToSerial = async () => {
    try {
      await navigator.serial.requestPort();
      let ports = await navigator.serial.getPorts();
      ports = ports.filter((port) => port.connected);
      if (ports.length != 1) {
        alert(`Found ${ports.length} ports to read. Cannot decide.`);
        return;
      }
      const port = ports[0];
      await port.open({ baudRate: 9600 }); // Or your baud rate
      setPort(port);
      setIsConnected(true);

      const reader = port.readable.getReader();
      setReader(reader);

      // Start reading loop
      readLoop(reader);
    } catch (error) {
      console.error("Error opening serial port:", error);
    }
  };

  const handleSerialRead = (inputString: string) => {
    // Assume all reads must be buzzes
    const buzzedTeams = inputString.split(";");
    buzzedTeams.sort(() => Math.random() - 0.5);
    // console.log(buzzedTeams);
    for (const team of buzzedTeams) {
      if (team.length > 0) {
        const teamName = teamNumberToName(parseInt(team));
        setTeamQueue((oldQueue) => {
          if (oldQueue.includes(teamName)) {
            return oldQueue;
          }
          return [...oldQueue, teamName];
        });
      }
    }
  };

  const readLoop = async (reader) => {
    let partialMessage = "";
    const terminator = "\n";
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

          partialMessage = partialMessage.substring(
            terminatorIndex + terminator.length
          );
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
      await reader.cancel(); // Stop the reader
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
  }, [port, reader]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: { key: string }) => {
      if (event.key === "Delete") {
        setTeamQueue([]);
      }
      // if (event.key === 'Enter') {
      //   setTeamQueue((oldQueue) => [...oldQueue, `Team ${oldQueue.length + 1}`]);
      // }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);


  if (!isConnected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "95vh" }}>
        <div style={{ flex: 1 }} className="row">
          <button className="big" onClick={connectToSerial}>
            Connect to Serial
          </button>
        </div>
      </div>
    );
  }

    return (
      <BuzzerPage
        teamQueue={teamQueue}
      />
    );
}

export default App;
