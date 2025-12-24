import { formatTime } from "../utils/helpers";

const Timer = ({ sessionType, seconds, pomodoroCount }) => {
  return (
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
  );
};

export default Timer;
