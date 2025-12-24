import { getThemeColor } from "../utils/helpers";

const ControlButtons = ({
  isRunning,
  stopTimer,
  startTimer,
  sessionType,
  resetTimer,
  setPomodoroCount,
  updateTimerTo,
}) => {
  const resetPomodoro = () => {
    stopTimer();
    setPomodoroCount(0);
    updateTimerTo("pomodoro");
  };
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={isRunning ? stopTimer : startTimer}
        className={`w-full py-4 rounded-2xl text-xl font-semibold text-white transition-all transform active:scale-95 shadow-lg hover:cursor-pointer ${
          isRunning
            ? "bg-gray-800 hover:bg-gray-900"
            : `${getThemeColor(sessionType)} hover:opacity-80`
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
          onClick={resetPomodoro}
          className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors hover:cursor-pointer"
        >
          Clear Pomodoros
        </button>
      </div>
    </div>
  );
};

export default ControlButtons;
