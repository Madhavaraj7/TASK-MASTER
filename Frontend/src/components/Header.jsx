import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import TaskIcon from "@mui/icons-material/Task";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 bg-gray-800 text-white shadow-md">
      <h1
        onClick={() => navigate("/home")}
        className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text shadow-lg tracking-wider hover:scale-105 transition-transform duration-300 cursor-pointer"
      >
        TaskMaster
      </h1>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-0">
        <Button
          onClick={() => navigate("/tasks")}
          variant="contained"
          color="primary"
          startIcon={<TaskIcon />}
          sx={{
            background: "linear-gradient(45deg, #4a90e2 30%, #8e44ad 90%)",
            color: "white",
            borderRadius: "20px",
            "&:hover": {
              background: "linear-gradient(45deg, #5b99e2 30%, #9e5fbc 90%)",
            },
            padding: "10px 20px",
            fontWeight: "bold",
          }}
        >
          My Tasks
        </Button>
        <Button
          onClick={handleLogout}
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          sx={{
            background: "linear-gradient(45deg, #e74c3c 30%, #c0392b 90%)",
            color: "white",
            borderRadius: "20px",
            "&:hover": {
              background: "linear-gradient(45deg, #e86f6f 30%, #c25b5b 90%)",
            },
            padding: "10px 20px",
            fontWeight: "bold",
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
