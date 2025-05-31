import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

function Register() {
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setId, setUsername: setGlobalUsername } = useContext(UserContext);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({
          name,
          lastname,
          username,
          password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setId(data.id); 
        setGlobalUsername(data.username);
        navigate("/");
        window.location.reload()
      } else {
        alert("Registration failed: " + data.error);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-[40px]" style={{ fontFamily: "var(--stardom-font)" }}>
        Create Your Account
      </h1>
      <div className="flex flex-col gap-4 w-[300px] align-center">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Lastname"
          className="border p-2 rounded-lg"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
        />
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
          onClick={handleRegister}
          className="bg-black text-white py-2 rounded-lg hover:scale-105 transition"
        >
          Register
        </button>
       <div className="w-full text-center">
        <p>Already have an account? <button onClick={() => navigate("/login")} className="hover:cursor-pointer"><b>Login</b></button></p>
       </div>
      </div>
    </div>
  );
}

export default Register;
