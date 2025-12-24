export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
};

export const getThemeColor = (sessionType) => {
  if (sessionType === "pomodoro") return "bg-rose-400";
  if (sessionType === "shortBreak") return "bg-teal-400";
  return "bg-indigo-400";
};
