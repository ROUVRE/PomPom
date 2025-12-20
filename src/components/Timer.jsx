import { useRef, useState, useEffect } from "react";
import useNativeNotification from "../hooks/useNativeNotification";

const Timer = () => {
  const { triggerNotification } = useNativeNotification();

  // Values in seconds
  // CHANGE THESE SECONDS FOR DEBUGGING PURPOSE DONT FORGET TO CHANGE TO DEFAULT VALUES!!!!!!
  const SESSION_PRESETS = {
    focus: 1500, // DEFAULT: 1500 (25 mins)
    shortBreak: 300, // DEFAULT: 300 (5 mins)
    longBreak: 900, // DEFAULT: 900 (15 mins)
  };

  const isProcessingRef = useRef(false);
  const [seconds, setSeconds] = useState(SESSION_PRESETS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState("focus");
  const [focusCount, setFocusCount] = useState(0);

  const intervalRef = useRef(null);
  const sessionTypeRef = useRef(sessionType);
  const focusCountRef = useRef(focusCount);

  useEffect(() => {
    sessionTypeRef.current = sessionType;
  }, [sessionType]);

  useEffect(() => {
    focusCountRef.current = focusCount;
  }, [focusCount]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
  };

  const startTimer = () => {
    if (intervalRef.current !== null || seconds <= 0) return;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          stopTimer();
          handleSessionComplete();
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
  };

  const updateTimerTo = (newSessionType) => {
    setSessionType(newSessionType);
    setSeconds(SESSION_PRESETS[newSessionType]);
  };

  const handleSessionComplete = () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const currentType = sessionTypeRef.current;
    const timestamp = Date.now();

    if (currentType === "focus") {
      const nextCount = focusCountRef.current + 1;
      setFocusCount(nextCount);

      if (nextCount % 4 === 0) {
        triggerNotification("Time for a Long Break!", {
          body: "Great job! 4 sessions done.",
          tag: `long-break-${timestamp}`,
          renotify: true,
        });
        updateTimerTo("longBreak");
      } else {
        triggerNotification("Focus Session Complete", {
          body: "Time for a short break.",
          tag: `short-break-${timestamp}`,
          renotify: true,
        });
        updateTimerTo("shortBreak");
      }
    } else {
      triggerNotification("Break is over!", {
        body: "Ready to get back to work?",
        tag: `back-to-work-${timestamp}`,
        renotify: true,
      });
      updateTimerTo("focus");
    }

    setTimeout(() => {
      isProcessingRef.current = false;
    }, 1000);
  };

  const resetFocusCount = () => {
    stopTimer();
    setFocusCount(0);
    updateTimerTo("focus");
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(SESSION_PRESETS[sessionType]);
  };

  const setTimerTo = (sessionTypeValue) => {
    stopTimer();
    setSessionType(sessionTypeValue);
    setSeconds(SESSION_PRESETS[sessionTypeValue]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  };

  return (
    <>
      <div className="m-6 text-6xl text-center text-amber-50">
        {formatTime(seconds)}
      </div>

      <div className="text-center">
        {isRunning === false ? (
          <button
            onClick={startTimer}
            className="m-1.5 pl-3 pr-3 hover:cursor-pointer bg-green-400 text-white"
          >
            Start
          </button>
        ) : (
          <button
            onClick={stopTimer}
            className="m-1.5 pl-3 pr-3 hover:cursor-pointer bg-amber-300"
          >
            Pause
          </button>
        )}

        <button
          onClick={resetTimer}
          className="m-1.5 pl-3 pr-3 hover:cursor-pointer bg-red-500 text-amber-50"
        >
          Reset Timer
        </button>

        <button
          onClick={resetFocusCount}
          className="m-1.5 pl-3 pr-3 hover:cursor-pointer bg-blue-500 text-white"
        >
          Reset Pomodoro
        </button>

        <div>
          <button
            onClick={() => setTimerTo("focus")}
            className="m-1.5 pl-3 pr-3 bg-lime-50"
          >
            Focus
          </button>
          <button
            onClick={() => setTimerTo("shortBreak")}
            className="m-1.5 pl-3 pr-3 bg-green-200"
          >
            Short Break
          </button>
          <button
            onClick={() => setTimerTo("longBreak")}
            className="m-1.5 pl-3 pr-3 bg-sky-300"
          >
            Long Break
          </button>
        </div>
      </div>
    </>
  );
};

export default Timer;
