import { useState } from "react";

const TaskList = () => {
  const [inputValue, setInputValue] = useState("");
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (inputValue.trim() !== "") {
      setTasks((prevTasks) => [...prevTasks, inputValue]);
      setInputValue("");
    }
  };

  return (
    <>
      <input
        type="text"
        name="taskInput"
        className="border bg-white m-4 pl-2"
        placeholder="Add a task"
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        value={inputValue}
      />
      <button
        onClick={addTask}
        className="hover:cursor-pointer bg-green-400 text-white pl-3 pr-3"
      >
        Add
      </button>
      <ol className="list-decimal">
        {tasks.map((task, index) => {
          return <li key={index}>{task}</li>;
        })}
      </ol>
    </>
  );
};

export default TaskList;
