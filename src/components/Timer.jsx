import { useRef, useState, useEffect } from "react";

const Timer = () => {
  const SESSION_PRESETS = {
    focus: 60,
    shortBreak: 3,
    longBreak: 10,
  };

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
      console.log(
        "Ongoing session: " + sessionType + ", cycle count: " + focusCount
      );
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
    const currentType = sessionTypeRef.current;

    if (currentType === "focus") {
      const nextCount = focusCountRef.current + 1;
      setFocusCount(nextCount);

      if (nextCount % 4 === 0) {
        updateTimerTo("longBreak");
      } else {
        updateTimerTo("shortBreak");
      }
    } else if (currentType === "shortBreak" || currentType === "longBreak") {
      updateTimerTo("focus");
    }

    // startTimer();
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

      {/* <p className="text-center text-xl text-gray-300 mb-4">
        Current Session: **{sessionType.toUpperCase()}** | Completed Cycles: **
        {focusCount}**
      </p> */}

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
            className="m-1.5 pl-3 pr-3 outline-1 hover:cursor-pointer bg-lime-50"
          >
            Focus
          </button>
          <button
            onClick={() => setTimerTo("shortBreak")}
            className="m-1.5 pl-3 pr-3 outline-1 hover:cursor-pointer bg-green-200"
          >
            Short Break
          </button>
          <button
            onClick={() => setTimerTo("longBreak")}
            className="m-1.5 pl-3 pr-3 outline-1 hover:cursor-pointer bg-sky-300"
          >
            Long Break
          </button>
        </div>
      </div>
    </>
  );
};

export default Timer;
