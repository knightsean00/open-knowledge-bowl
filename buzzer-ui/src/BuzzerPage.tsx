import React, { useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArduinoMode } from "./App";

interface BuzzerPageProps {
  teamQueue: string[];
  setArduinoMode: (newMode: ArduinoMode) => void;
}

const secondsToAnswer = 3;

const itemVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }, // Animate to the left on exit
};

const BuzzerPage: React.FC<BuzzerPageProps> = ({ teamQueue, setArduinoMode }) => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [activeTeamIndex, setActiveTeamIndex] = useState(-1);


  useEffect(() => {
    const handleGlobalKeyDown = (event: { keyCode: number; }) => {
      if (event.keyCode === 32) {
        // Need to find a way to prevent incrementation when is less than teamQueue, might have to useRefs?
        setActiveTeamIndex((oldActiveTeamIndex) => oldActiveTeamIndex + 1);
        setRemainingTime(secondsToAnswer * 1000);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  useEffect(() => {
    if (teamQueue.length === 1 && activeTeamIndex === -1) {
      setActiveTeamIndex(0);
      setRemainingTime(secondsToAnswer * 1000);
    } else if (teamQueue.length === 0) {
      setActiveTeamIndex(-1);
      setRemainingTime(0);
    } else if (activeTeamIndex === teamQueue.length - 2 && remainingTime === 0) {
      setActiveTeamIndex(teamQueue.length - 1);
      setRemainingTime(secondsToAnswer * 1000);
    } else if (activeTeamIndex === teamQueue.length - 1 && remainingTime < secondsToAnswer * 1000) {
      setRemainingTime(secondsToAnswer * 1000);
    }
  }, [teamQueue])

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 17 >= 0 ? prevTime - 17 : 0);
      }, 17);
    } else {
      setRemainingTime(0);
    }

    return () => clearInterval(timer);
  }, [remainingTime]);


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "95vh" }}>
      <motion.div className="row" style={{ height: "10vh" }}>
        <LayoutGroup>
          <AnimatePresence>
            {teamQueue.map((team, idx) => (
              <motion.div
                key={team}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
                style={{
                  whiteSpace: 'nowrap',
                }}
                className={idx === activeTeamIndex ? "active" : "inactive"}
              >
                {team}
              </motion.div>
            ))}
          </AnimatePresence>
        </LayoutGroup>
      </motion.div>
      <div style={{ height: "75vh", alignItems: "center", justifyContent: "center", display: "flex" }}>
        {
          activeTeamIndex >= 0 && activeTeamIndex < teamQueue.length ?
            <h1>{(remainingTime / 1000).toFixed(3)}</h1> :
            <h1>Waiting for buzzes</h1>
        }
      </div>
      <div style={{ flex: 1 }} className="row">
        <button onClick={() => setArduinoMode(ArduinoMode.LOG_SENSOR)}>dev mode</button>
      </div>
    </div>
  );
}

export default BuzzerPage;
