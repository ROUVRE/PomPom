import { useRef, useState, useEffect } from "react";
import useNativeNotification from "../hooks/useNativeNotification";
import digitalAlarm from "/sounds/digitalAlarm.ogg";
import eggTimer from "/sounds/eggTimer.ogg";

const Timer = () => {
  const { triggerNotification, requestPermission } = useNativeNotification();

  const SOUNDS = {
    digitalAlarm,
    eggTimer,
  };

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
    requestPermission();
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
        triggerNotification(
          "Time for a Long Break!",
          {
            body: "Great job! 4 sessions done.",
            tag: `long-break-${timestamp}`,
            renotify: true,
          },
          SOUNDS.digitalAlarm
        );
        updateTimerTo("longBreak");
      } else {
        triggerNotification(
          "Focus Session Complete",
          {
            body: "Time for a short break.",
            tag: `short-break-${timestamp}`,
            renotify: true,
          },
          SOUNDS.digitalAlarm
        );
        updateTimerTo("shortBreak");
      }
    } else {
      triggerNotification(
        "Break is over!",
        {
          body: "Ready to get back to work?",
          tag: `back-to-work-${timestamp}`,
          renotify: true,
        },
        SOUNDS.digitalAlarm
      );
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  };

  const getThemeColor = () => {
    if (sessionType === "focus") return "bg-rose-500";
    if (sessionType === "shortBreak") return "bg-teal-500";
    return "bg-indigo-500";
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${getThemeColor().replace(
        "bg-",
        "bg-opacity-10 bg-"
      )}`}
    >
      <main className="min-h-screen flex flex-col w-full">
        {/* --- HEADER --- */}
        <header className="w-full py-6 px-8 flex justify-center items-center backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 font-bold shadow-sm bg-amber-50">
              P
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">
              Pom<span className="text-amber-50">Pom</span>
            </h1>
          </div>
        </header>

        {/* --- CONTENT AREA --- */}
        {/* Removed items-center and justify-center to move the box up */}
        <div className="flex-1 w-full flex flex-col items-center pt-8 px-4">
          {/* THE TIMER CARD */}
          <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20">
            {/* Session Tabs */}
            <div className="flex justify-between p-1 mb-8 bg-gray-100/50 rounded-2xl">
              {["focus", "shortBreak", "longBreak"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    stopTimer();
                    updateTimerTo(type);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 capitalize hover:cursor-pointer ${
                    sessionType === type
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {type.replace(/([A-Z])/g, " $1")}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div
                className={`text-8xl font-light tracking-tighter tabular-nums transition-colors duration-300 ${
                  sessionType === "focus"
                    ? "text-rose-600"
                    : sessionType === "shortBreak"
                    ? "text-teal-600"
                    : "text-indigo-600"
                }`}
              >
                {formatTime(seconds)}
              </div>
              <p className="mt-2 text-gray-400 font-medium uppercase tracking-widest text-xs h-4">
                {sessionType === "focus" && `Session #${focusCount + 1}`}
                {sessionType === "shortBreak" && `Taking a break`}
                {sessionType === "longBreak" && `Taking a long break`}
              </p>
            </div>

            {/* Main Controls */}
            <div className="flex flex-col gap-4">
              <button
                onClick={isRunning ? stopTimer : startTimer}
                className={`w-full py-4 rounded-2xl text-xl font-semibold text-white transition-all transform active:scale-95 shadow-lg hover:cursor-pointer ${
                  isRunning
                    ? "bg-gray-800 hover:bg-gray-900"
                    : `${getThemeColor()} hover:opacity-90`
                }`}
              >
                {isRunning ? "PAUSE" : "START"}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={resetTimer}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors hover:cursor-pointer"
                >
                  Reset Current Timer
                </button>
                <button
                  onClick={resetFocusCount}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors hover:cursor-pointer"
                >
                  Clear Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Timer;
