import SessionToggle from "./SessionToggle";
import Timer from "./Timer";
import ControlButtons from "./ControlButtons";

const TimerContainer = ({
  startTimer,
  stopTimer,
  updateTimerTo,
  sessionType,
  seconds,
  pomodoroCount,
  isRunning,
  resetTimer,
  setPomodoroCount,
}) => {
  return (
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20">
      <SessionToggle
        stopTimer={stopTimer}
        updateTimerTo={updateTimerTo}
        sessionType={sessionType}
      />

      <Timer
        sessionType={sessionType}
        seconds={seconds}
        pomodoroCount={pomodoroCount}
      />

      <ControlButtons
        startTimer={startTimer}
        isRunning={isRunning}
        stopTimer={stopTimer}
        sessionType={sessionType}
        resetTimer={resetTimer}
        setPomodoroCount={setPomodoroCount}
        updateTimerTo={updateTimerTo}
      />
    </div>
  );
};

export default TimerContainer;
