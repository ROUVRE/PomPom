const SessionToggle = ({ stopTimer, updateTimerTo, sessionType }) => {
  return (
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
  );
};

export default SessionToggle;
