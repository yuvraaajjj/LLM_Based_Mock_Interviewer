import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext"; // Assuming UserContext is defined and providing state
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setId, setUsername: setGlobalUsername } = useContext(UserContext);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/login",
        {
          username,
          password,
        },
        {
          withCredentials: true, 
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        }
      );
      console.log("Login successful:", response.data.message);

      setGlobalUsername(username); 
      if (response.data.id) {
        setId(response.data.id);
      }

      navigate("/");
      window.location.reload()
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert("Login failed: " + (error.response?.data || error.message));
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-[40px]" style={{ fontFamily: "var(--stardom-font)" }}>
        Welcome Back
      </h1>
      <div className="flex flex-col gap-4 w-[300px]">
        <input
          type="text"
          placeholder="Username"
          className="border p-2 rounded-lg"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-black text-white py-2 rounded-lg hover:scale-105 transition"
        >
          Login
        </button>
        <div className="w-full text-center">
          <p>Don't have an account? <button onClick={() => navigate("/register")} className="hover:cursor-pointer">
              <b>SignUp</b>
            </button>
          </p>
       </div>
      </div>
    </div>
  );
}

export default Login;
