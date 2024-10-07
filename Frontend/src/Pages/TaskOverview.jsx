// TaskOverview.js
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import { toast } from "react-toastify";
import Header from "../components/Header";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const TaskOverview = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [tasks, setTasks] = useState([]);

  const fetchStatistics = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${backendUrl}/api/tasks/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch statistics");

      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Failed to fetch statistics");
    }
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${backendUrl}/api/tasks`, {
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

  // Fetch statistics and tasks on component mount
  useEffect(() => {
    fetchStatistics();
    fetchTasks();
  }, []);

  const chartData = [
    { name: "Completed", value: stats.completedTasks },
    { name: "Overdue", value: stats.overdueTasks },
    {
      name: "Pending",
      value: stats.totalTasks,
    },
  ];

  const COLORS = ["#28a745", "#dc3545", "#007bff"];

  return (
    <>
      <div className="sticky top-0 z-10">
        <Header />
      </div>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-500">
        <div className="flex flex-col w-full max-w-4xl p-7 mx-auto bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 rounded-xl shadow-md">
          {/* Task Statistics */}
          <h2 className="text-xl font-semibold mb-4 text-white">
            Task Statistics
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-500 p-4 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-bold">Completed</h3>
              <p className="text-2xl">{stats.completedTasks}</p>
            </div>
            <div className="bg-red-500 p-4 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-bold">Overdue</h3>
              <p className="text-2xl">{stats.overdueTasks}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-bold">Total Tasks</h3>
              <p className="text-2xl">{stats.totalTasks}</p>
            </div>
          </div>

          {/* Task Completion Overview Pie Chart */}
          <h2 className="text-xl font-semibold mb-4 mt-8 text-white text-center">
            Task Completion Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120} // Increase outer radius for a larger pie
                fill="#8884d8"
                label
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
                labelStyle={{ fontWeight: "bold", color: "#333" }}
                itemStyle={{ color: "#333" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default TaskOverview;
