import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { Edit, Delete } from "@mui/icons-material";
import todo_icon from "../assets/todo_icon.png";
import io from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const SocketUrl = import.meta.env.VITE_BACKEND_URL_SOCKET;

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const socket = useRef(null);

  const tasksPerPage = 4;
  const inputRef = useRef();

  useEffect(() => {
    socket.current = io(SocketUrl); 

    socket.current.on("taskAdded", (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.current.on("taskUpdated", (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    socket.current.on("taskDeleted", (taskId) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    });

    return () => {
      socket.current.disconnect(); 
    };
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${backendUrl}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!title.trim()) return;

    const method = currentTaskId ? "PUT" : "POST";
    const url = currentTaskId
      ? `${backendUrl}/tasks/${currentTaskId}`
      : `${backendUrl}/tasks`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error("Failed to save task");

      const taskData = await res.json();
      console.log("t", taskData);

      if (currentTaskId) {
        setTasks(
          tasks.map((task) => (task._id === currentTaskId ? taskData : task))
        );
        toast.success("Task updated successfully!");
      } else {
        setTasks([...tasks, taskData]);
        toast.success("Task added successfully!");
      }

      setTitle("");
      setCurrentTaskId(null);
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error(error.message);
    }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${backendUrl}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(tasks.filter((task) => task._id !== id));
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const toggleTask = async (id) => {
    const token = localStorage.getItem("token");
    const task = tasks.find((task) => task._id === id);
    try {
      const res = await fetch(`${backendUrl}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      const updatedTask = await res.json();
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error.message);
    }
  };

  const editTask = (task) => {
    setTitle(task.title);
    setCurrentTaskId(task._id);
    inputRef.current.focus();
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="sticky top-0 z-10">
        <Header />
      </div>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-500">
        <div className="bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 w-11/12 max-w-md flex flex-col p-7 min-h-[550px] rounded-xl shadow-md">
          <div className="flex items-center gap-2">
            <img className="w-8" src={todo_icon} alt="todo-icon" />
            <h1 className="text-3xl font-semibold text-gray-800">
              Add your tasks
            </h1>
          </div>

          <form
            onSubmit={handleTaskSubmit}
            className="flex items-center my-7 bg-gray-200 rounded-full shadow-md"
          >
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-0 outline-none flex-1 h-14 pl-6 pr-2 placeholder:text-slate-600 text-gray-800"
              placeholder="Enter your task"
            />
            <button
              type="submit"
              className="border-none rounded-full bg-green-600 w-32 h-14 text-white text-lg font-medium cursor-pointer hover:bg-green-700 transition duration-300"
            >
              {currentTaskId ? "Update" : "ADD +"}
            </button>
          </form>

          <div>
            {currentTasks.length === 0 ? (
              <p className="text-center text-gray-500">No tasks available.</p>
            ) : (
              currentTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center my-3 gap-2 bg-white p-4 rounded-md shadow-md hover:bg-gray-100 transition duration-300"
                >
                  <div
                    onClick={() => toggleTask(task._id)}
                    className="flex flex-1 items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task._id)}
                      className="form-checkbox h-6 w-6 text-green-600"
                    />
                    <p
                      className={`text-slate-700 ml-4 text-[17px] ${
                        task.completed ? "line-through" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>
                  <button
                    onClick={() => editTask(task)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    <Edit />
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Delete />
                  </button>
                </div>
              ))
            )}

            <div className="flex justify-center mt-6">
              {Array.from({
                length: Math.ceil(tasks.length / tasksPerPage),
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`mx-1 px-3 py-1 rounded-full ${
                    currentPage === index + 1
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskManagement;
