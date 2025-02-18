import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArduinoMode } from "./App";

interface BuzzerPageProps {
  teamQueue: string[];
  requestArduinoMode: (newMode: ArduinoMode) => void;
  secondsToAnswer?: number;
}

const itemVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }, // Animate to the left on exit
};

const BuzzerPage: React.FC<BuzzerPageProps> = ({ teamQueue, requestArduinoMode, secondsToAnswer = 15 }) => {
  const latestTeamQueue = useRef(teamQueue);
  const latestSecondsToAnswer = useRef(secondsToAnswer);
  const [remainingTime, setRemainingTime] = useState(0);
  const [activeTeamIndex, setActiveTeamIndex] = useState(-1);

  useEffect(() => {
    latestTeamQueue.current = teamQueue;
  }, [teamQueue]);

  useEffect(() => {
    latestSecondsToAnswer.current = secondsToAnswer
  }, [secondsToAnswer]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: { keyCode: number; }) => {
      // Space bar pressed, move onto next team
      if (event.keyCode === 32) {
        setActiveTeamIndex((oldActiveTeamIndex) => {
          if (oldActiveTeamIndex < latestTeamQueue.current.length - 1) {
            setRemainingTime(latestSecondsToAnswer.current * 1000);
            return oldActiveTeamIndex + 1;
          }

          return oldActiveTeamIndex;
        });
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // I am unsure if secondsToAnswer needs to be changed to latestSecondsToAnswer.current since
  // it is not a callback...
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

  // TODO Make a nice timer graphic
  const progress = 1 - (remainingTime / (secondsToAnswer * 1000));
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
            <h1 style={{ fontSize: "10em", color: `hsl(356 ${Math.floor(progress * 100)}% 65%)` }}>{(remainingTime / 1000).toFixed(3)}</h1> :
            <h1 style={{ fontSize: "6em" }}>Waiting for buzzes</h1>
        }
      </div>
      <div style={{ flex: 1 }} className="row">
        <button onClick={() => requestArduinoMode(ArduinoMode.LOG_SENSOR)}>dev mode</button>
      </div>
    </div>
  );
}

export default BuzzerPage;
