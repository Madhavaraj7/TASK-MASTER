import Task from "../models/Task.js";
import { io } from "../server.js";

//Get a task
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Task
export const createTask = async (req, res) => {
  const task = new Task({ ...req.body, userId: req.user.id });

  try {
    const savedTask = await task.save();
    io.emit("taskAdded", savedTask);
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or not owned by user" });
    }

    io.emit("taskUpdated", updatedTask);
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or not owned by user" });
    }

    io.emit("taskDeleted", req.params.id); // Emit real-time event
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get task statistics for the authenticated user
export const getTaskStatistics = async (req, res) => {
  try {
    // console.log("Fetching tasks for user:", req.user.id); 

    const totalTasks = await Task.countDocuments({ userId: req.user.id });
    console.log(totalTasks);

    const completedTasks = await Task.countDocuments({
      userId: req.user.id,
      completed: true,
    });
    console.log(completedTasks);

    const overdueTasks = await Task.countDocuments({
      userId: req.user.id,
      completed: false,
    });
    console.log(overdueTasks);

    res.json({
      totalTasks,
      completedTasks,
      overdueTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
