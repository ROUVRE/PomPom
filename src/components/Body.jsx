import TimerContainer from "./TimerContainer";

const MainContainer = ({
  startTimer,
  stopTimer,
  setPomodoroCount,
  updateTimerTo,
  sessionType,
  seconds,
  pomodoroCount,
  isRunning,
  resetTimer,
}) => {
  return (
    <main className="flex flex-col w-full mb-8">
      <div className="w-full flex flex-col items-center pt-8 px-4">
        <TimerContainer
          startTimer={startTimer}
          stopTimer={stopTimer}
          updateTimerTo={updateTimerTo}
          sessionType={sessionType}
          seconds={seconds}
          pomodoroCount={pomodoroCount}
          isRunning={isRunning}
          resetTimer={resetTimer}
          setPomodoroCount={setPomodoroCount}
        />
      </div>
    </main>
  );
};

export default MainContainer;
