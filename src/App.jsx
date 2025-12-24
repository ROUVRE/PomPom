import { useRef, useState, useEffect } from "react";
import { SOUNDS } from "./utils/constants.js";
import { getThemeColor } from "./utils/helpers.js";
import Header from "./components/Header.jsx";
import Body from "./components/Body.jsx";
import Footer from "./components/Footer";
import Modal from "./components/Modal";
import useNativeNotification from "./hooks/useNativeNotification";

function App() {
  const { triggerNotification, requestPermission } = useNativeNotification();

  const isFirstRender = useRef(true);

  const [presets, setPresets] = useState(() => {
    const savedPresets = localStorage.getItem("pompom_presets");
    return savedPresets
      ? JSON.parse(savedPresets)
      : {
          pomodoro: 25 * 60,
          shortBreak: 5 * 60,
          longBreak: 15 * 60,
        };
  });

  const [selectedSoundKey, setSelectedSoundKey] = useState(() => {
    return localStorage.getItem("pompom_sound") || "alarm";
  });

  const [tempPresets, setTempPresets] = useState({ ...presets });
  const [tempSound, setTempSound] = useState(selectedSoundKey);

  const isProcessingRef = useRef(false);
  const [timestamp, setTimestamp] = useState(() => Date.now());

  const [seconds, setSeconds] = useState(presets.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState("pomodoro");
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const initializeSettingsMenu = () => {
    setTempPresets({ ...presets });
    setTempSound(selectedSoundKey);
    isFirstRender.current = true;
    setIsSettingsOpen(true);
  };

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const intervalRef = useRef(null);
  const sessionTypeRef = useRef(sessionType);
  const pomodoroCountRef = useRef(pomodoroCount);

  useEffect(() => {
    if (isSettingsOpen) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      const audio = new Audio(SOUNDS[tempSound]);
      audio.volume = 0.5;
      audio.play().catch(() => {});

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [tempSound, isSettingsOpen]);

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
          body: "Let's get back to work",
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

  const handleSaveSettings = () => {
    const timeChanged =
      tempPresets.pomodoro !== presets.pomodoro ||
      tempPresets.shortBreak !== presets.shortBreak ||
      tempPresets.longBreak !== presets.longBreak;

    setPresets(tempPresets);
    setSelectedSoundKey(tempSound);

    localStorage.setItem("pompom_presets", JSON.stringify(tempPresets));
    localStorage.setItem("pompom_sound", tempSound);

    if (timeChanged) {
      stopTimer();
      setSeconds(tempPresets[sessionType]);
    }

    setIsSettingsOpen(false);
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(presets[sessionType]);
  };

  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-500 ${getThemeColor(
          sessionType
        ).replace("bg-", "bg-opacity-10 bg-")}`}
      >
        <Header
          setIsHelpOpen={setIsHelpOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          setTempPresets={setTempPresets}
          setTempSound={setTempSound}
          presets={presets}
          selectedSoundKey={selectedSoundKey}
          initializeSettingsMenu={initializeSettingsMenu}
        />

        <Body
          startTimer={startTimer}
          stopTimer={stopTimer}
          setPomodoroCount={setPomodoroCount}
          updateTimerTo={updateTimerTo}
          sessionType={sessionType}
          seconds={seconds}
          pomodoroCount={pomodoroCount}
          isRunning={isRunning}
          resetTimer={resetTimer}
        />

        <Footer />

        {/* Help Modal*/}
        <Modal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title="Help"
        >
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2 text-slate-800">
                What is the Pomodoro Technique?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                <strong>The Pomodoro Technique</strong> is a time-management
                method developed by Francesco Cirillo. It uses a timer to break
                work into focused 25-minute intervals (each called a{" "}
                <strong>"Pomodoro"</strong>), separated by short 5-minute
                breaks, with longer 15-30 minute breaks after every four
                pomodoros.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                This simple <strong>Pomodoro Timer</strong> created using React
                was made to help you focus, manage time, and avoid burnout while
                working or studying.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2 text-slate-800">
                How to use this app?
              </h3>
              <div className="flex gap-4 items-start">
                <div className="bg-rose-100 text-rose-600 p-2 rounded-lg font-bold">
                  01
                </div>
                <p>
                  Press start on the timer and let the minutes past (by default
                  it is set to 25 minutes). Use this time to{" "}
                  <span className="text-rose-600">FOCUS</span> on your work
                  while avoiding distractions.
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-teal-100 text-teal-600 p-2 rounded-lg font-bold">
                  02
                </div>
                <p>
                  After the Pomodoro timer has gone off, you will be notified.
                  You will be given (by default) 5 minutes{" "}
                  <span className="text-teal-600">BREAK TIME</span>. Feel free
                  to do anything that could help refresh your mind.
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg font-bold">
                  03
                </div>
                <p>
                  After 4 pomodoros, enjoy a 15-minute{" "}
                  <span className="text-indigo-600">LONG BREAK</span>. Rinse and
                  repeat.
                </p>
              </div>
            </div>
          </div>
        </Modal>

        {/* Settings Modal */}
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
                  { label: "Short Break", key: "shortBreak" },
                  { label: "Long Break", key: "longBreak" },
                ].map((item) => (
                  <div key={item.key} className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 font-medium">
                      {item.label}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={tempPresets[item.key] / 60 || ""}
                      onChange={(e) => {
                        let val = e.target.value;

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
            <p className="text-sm text-slate-600 leading-relaxed">
              Applying a new time setting will reset the current timer to the
              new duration.
            </p>

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
            <p className="text-sm text-slate-600 leading-relaxed">
              New alarm sound will be applied on the next timer start after
              pressing Save & Apply.
            </p>

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
    </>
  );
}

export default App;
