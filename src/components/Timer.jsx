import { useRef, useState, useEffect } from "react";
import useNativeNotification from "../hooks/useNativeNotification";
import Modal from "./Modal";
import Footer from "./Footer";
import digitalAlarm from "/sounds/digitalAlarm.ogg";
import eggTimer from "/sounds/eggTimer.ogg";
import appLogo from "/src/assets/images/PomPom.png";

const SOUNDS = {
  alarm: digitalAlarm,
  eggTimer: eggTimer,
};

const Timer = () => {
  const { triggerNotification, requestPermission } = useNativeNotification();

  const isFirstRender = useRef(true);

  const [presets, setPresets] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  const [selectedSoundKey, setSelectedSoundKey] = useState("alarm");

  const [tempPresets, setTempPresets] = useState({ ...presets });
  const [tempSound, setTempSound] = useState(selectedSoundKey);

  const isProcessingRef = useRef(false);
  const [timestamp, setTimestamp] = useState(() => Date.now());

  const [seconds, setSeconds] = useState(presets.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState("pomodoro");
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // Modal States
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const intervalRef = useRef(null);
  const sessionTypeRef = useRef(sessionType);
  const pomodoroCountRef = useRef(pomodoroCount);

  // --- PREVIEW SOUND LOGIC ---
  useEffect(() => {
    if (isSettingsOpen) {
      // If this is the first time the modal opened, don't play.
      // Just flip the ref to false and exit.
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      // Every change AFTER the first one will trigger this:
      const audio = new Audio(SOUNDS[tempSound]);
      audio.volume = 0.5;
      audio.play().catch(() => {});

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [tempSound, isSettingsOpen]); // Removed selectedSoundKey from here

  useEffect(() => {
    sessionTypeRef.current = sessionType;
  }, [sessionType]);

  useEffect(() => {
    pomodoroCountRef.current = pomodoroCount;
  }, [pomodoroCount]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 1000);

    return () => clearInterval(interval);
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

  const updateTimerTo = (newSessionType, customPresets = presets) => {
    setSessionType(newSessionType);
    setSeconds(customPresets[newSessionType]);
  };

  const handleSessionComplete = () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const currentType = sessionTypeRef.current;
    const soundToPlay = SOUNDS[selectedSoundKey];

    if (currentType === "pomodoro") {
      const nextCount = pomodoroCountRef.current + 1;
      setPomodoroCount(nextCount);

      if (nextCount % 4 === 0) {
        triggerNotification(
          "Time for a Long Break!",
          {
            body: "Great job! 4 pomodoros done.",
            tag: `long-break-${timestamp}`,
            renotify: true,
          },
          soundToPlay
        );
        updateTimerTo("longBreak");
      } else {
        triggerNotification(
          "Pomodoro Complete",
          {
            body: "Time for a short break.",
            tag: `short-break-${timestamp}`,
            renotify: true,
          },
          soundToPlay
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
        soundToPlay
      );
      updateTimerTo("pomodoro");
    }

    setTimeout(() => {
      isProcessingRef.current = false;
    }, 1000);
  };

  // --- SAVE SETTINGS ---
  const handleSaveSettings = () => {
    // Check if any of the time durations were actually changed
    const timeChanged =
      tempPresets.pomodoro !== presets.pomodoro ||
      tempPresets.shortBreak !== presets.shortBreak ||
      tempPresets.longBreak !== presets.longBreak;

    // 1. Update the actual presets and sound
    setPresets(tempPresets);
    setSelectedSoundKey(tempSound);

    // 2. Conditional Reset Logic
    if (timeChanged) {
      stopTimer(); // Stop the interval if it's running
      setSeconds(tempPresets[sessionType]); // Reset to the new duration
    }
    // If only sound changed, we do nothing to 'seconds',
    // keeping the timer running or paused exactly where it was.

    setIsSettingsOpen(false);
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(presets[sessionType]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  };

  const getThemeColor = () => {
    if (sessionType === "pomodoro") return "bg-rose-400";
    if (sessionType === "shortBreak") return "bg-teal-400";
    return "bg-indigo-400";
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${getThemeColor().replace(
        "bg-",
        "bg-opacity-10 bg-"
      )}`}
    >
      <main className="flex flex-col w-full mb-8">
        {/* Header and Logo code remains the same... */}
        <header className="w-full py-6 px-4 backdrop-blur-md">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-2 -ml-3 rounded-full hover:bg-black/5 transition-colors text-gray-700 hover:cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
            <div className="flex items-center gap-3 select-none">
              <img src={appLogo} alt="Logo" className="h-9 w-auto" />

              <h1 className="ml-0 text-3xl font-bold tracking-tight text-gray-800">
                Pom
                <span className="text-amber-50 text-shadow-black/50 text-shadow-sm">
                  Pom
                </span>
              </h1>
            </div>
            <button
              onClick={() => {
                setTempPresets({ ...presets }); // Sync temp state when opening
                setTempSound(selectedSoundKey); // Add this line!
                isFirstRender.current = true; // Mark as first open
                setIsSettingsOpen(true);
              }}
              className="p-2 -mr-3 rounded-full hover:bg-black/5 transition-colors text-gray-700 hover:cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </header>

        <div className="w-full flex flex-col items-center pt-8 px-4">
          <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20">
            <div className="flex justify-between p-1 mb-8 bg-gray-100/50 rounded-2xl">
              {["pomodoro", "shortBreak", "longBreak"].map((type) => (
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

            <div className="text-center mb-8">
              <div
                className={`text-8xl font-light tracking-tighter tabular-nums transition-colors duration-300 ${
                  sessionType === "pomodoro"
                    ? "text-rose-600"
                    : sessionType === "shortBreak"
                    ? "text-teal-600"
                    : "text-indigo-600"
                }`}
              >
                {formatTime(seconds)}
              </div>
              <p className="mt-2 text-gray-400 font-medium uppercase tracking-widest text-xs h-4">
                {sessionType === "pomodoro" && `Pomodoro #${pomodoroCount + 1}`}
                {sessionType === "shortBreak" && `Taking a break`}
                {sessionType === "longBreak" && `Taking a long break`}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={isRunning ? stopTimer : startTimer}
                className={`w-full py-4 rounded-2xl text-xl font-semibold text-white transition-all transform active:scale-95 shadow-lg hover:cursor-pointer ${
                  isRunning
                    ? "bg-gray-800 hover:bg-gray-900"
                    : `${getThemeColor()} hover:opacity-80`
                }`}
              >
                {isRunning ? "PAUSE" : "START"}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={resetTimer}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors hover:cursor-pointer"
                >
                  Reset Current
                </button>
                <button
                  onClick={() => {
                    stopTimer();
                    setPomodoroCount(0);
                    updateTimerTo("pomodoro");
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors hover:cursor-pointer"
                >
                  Clear Pomodoros
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Help Modal stays the same... */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Help & Tips"
      >
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="bg-rose-100 text-rose-600 p-2 rounded-lg font-bold">
              01
            </div>
            <p>Stay focused during the **Pomodoro** session.</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-teal-100 text-teal-600 p-2 rounded-lg font-bold">
              02
            </div>
            <p>Take a **Short Break** after every pomodoro.</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg font-bold">
              03
            </div>
            <p>After **4 pomodoros**, enjoy a 15-minute break.</p>
          </div>
        </div>
      </Modal>

      {/* --- UPDATED SETTINGS MODAL --- */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
      >
        <div className="py-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Time (Minutes)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Pomodoro", key: "pomodoro" },
                { label: "Short", key: "shortBreak" },
                { label: "Long", key: "longBreak" },
              ].map((item) => (
                <div key={item.key} className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-medium">
                    {item.label}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    // If the value is 0 (from being empty), show an empty string so it looks clean
                    value={tempPresets[item.key] / 60 || ""}
                    onChange={(e) => {
                      let val = e.target.value;

                      // Allow empty string while typing so backspace works
                      if (val === "") {
                        setTempPresets({ ...tempPresets, [item.key]: 0 });
                        return;
                      }

                      let num = Number(val);
                      if (num > 999) num = 999;

                      setTempPresets({
                        ...tempPresets,
                        [item.key]: num * 60,
                      });
                    }}
                    onBlur={(e) => {
                      // When the user clicks away, if the value is empty or 0, snap it to 1
                      if (Number(e.target.value) < 1) {
                        setTempPresets({
                          ...tempPresets,
                          [item.key]: 1 * 60,
                        });
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Alarm Sound
            </h3>
            <select
              value={tempSound}
              onChange={(e) => setTempSound(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="alarm">Digital Alarm</option>
              <option value="eggTimer">Egg Timer</option>
            </select>
          </div>

          {/* Action Button inside Modal to save */}
          <div className="pt-4">
            <button
              onClick={handleSaveSettings}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold transition-all active:scale-95 hover:cursor-pointer"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Timer;
