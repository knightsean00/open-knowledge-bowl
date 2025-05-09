import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArduinoMode } from "./App";
import { Circle } from "rc-progress";
import timerEnd from "/timer_end.mp3";
import useSound from "use-sound";

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


const BuzzerPage: React.FC<BuzzerPageProps> = ({
  teamQueue,
  requestArduinoMode,
  secondsToAnswer = 15,
}) => {
  const latestTeamQueue = useRef(teamQueue);
  const latestSecondsToAnswer = useRef(secondsToAnswer);
  const [remainingTime, setRemainingTime] = useState(0);
  const [activeTeamIndex, setActiveTeamIndex] = useState(-1);

  const [timerEndSound] = useSound(timerEnd);

  useEffect(() => {
    latestTeamQueue.current = teamQueue;
  }, [teamQueue]);

  useEffect(() => {
    latestSecondsToAnswer.current = secondsToAnswer;
  }, [secondsToAnswer]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: { keyCode: number }) => {
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

    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
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
    } else if (
      activeTeamIndex === teamQueue.length - 2 &&
      remainingTime === 0
    ) {
      setActiveTeamIndex(teamQueue.length - 1);
      setRemainingTime(secondsToAnswer * 1000);
    } else if (
      activeTeamIndex === teamQueue.length - 1 &&
      remainingTime < secondsToAnswer * 1000
    ) {
      setRemainingTime(secondsToAnswer * 1000);
    }
  }, [teamQueue]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          const newTime = prevTime - 17 >= 0 ? prevTime - 17 : 0;
          if (newTime === 0) {
            timerEndSound();
          }

          return newTime;
        });
      }, 17);
    } else {
      setRemainingTime(0);
    }

    return () => clearInterval(timer);
  }, [remainingTime]);

  // TODO Make a nice timer graphic
  const progress = 1 - remainingTime / (secondsToAnswer * 1000);
  const progressColor = `hsl(356 ${Math.floor(progress * 100)}% 80%)`;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "95vh" }}>
      <motion.div
        className="row"
        style={{ height: "10vh", textAlign: "center" }}
      >
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
                  whiteSpace: "nowrap",
                }}
                className={idx === activeTeamIndex ? "active" : "inactive"}
              >
                {team}
              </motion.div>
            ))}
          </AnimatePresence>
        </LayoutGroup>
      </motion.div>
      <div
        style={{
          height: "70vh",
          position: "relative",
          paddingTop: "3vh",
          paddingBottom: "3vh",
        }}
      >
        {activeTeamIndex >= 0 && activeTeamIndex < teamQueue.length ? (
          <>
            <div
              className="progress-number mono"
              style={{ color: progressColor }}
            >
              {(remainingTime / 1000).toFixed(3)}
            </div>
            <Circle
              className="progress-circle"
              strokeColor={progressColor}
              percent={(1 - progress) * 100}
              strokeWidth={3}
              trailColor="#777777"
            />
          </>
        ) : (
          <div className="progress-number">Waiting for buzzes</div>
        )}
      </div>
      <div style={{ flex: 1 }} className="row">
        <button onClick={() => requestArduinoMode(ArduinoMode.LOG_SENSOR)}>
          dev mode
        </button>
      </div>
    </div>
  );
};

export default BuzzerPage;
