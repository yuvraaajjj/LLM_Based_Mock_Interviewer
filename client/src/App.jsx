import React, { useState, useContext, useEffect } from "react";
import Logo from "./assets/image.png";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { UserCircle } from "lucide-react";

function App() {
  const [question, setQuestion] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const navigate = useNavigate();

  const { id, username, setId, setUsername } = useContext(UserContext);

  const handleButtonClick = () => {
    if (id) {
      navigate("/choose-topic");  
    } else {
      navigate("/register");      
    }
  };

  const startInterview = async (topic) => {
    if (!topic) return;
  
    setSelectedTopic(topic);
    setIsInterviewStarted(true);
    setQuestion("");
  
    // Reset backend session
    await fetch("http://127.0.0.1:5000/reset", { method: "POST" });

    navigate("/interview", { state: { topic } });
  };

  const handleLogin = () => {
    
    setId("user-id");  
    setUsername("user-username"); 
  };

  return (
    <div className="min-h-screen flex flex-col justify-start items-center relative">
      {/* Navigation Bar */}
      <nav className="fixed z-1 bg-white opacity-94 top-0 w-fit gap-5 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center w-[150px]">
          <img src={Logo} alt="Logo" className="w-10 h-10" />
        </div>

        <div
          className="hidden md:flex gap-8 w-250 justify-center text-gray-800"
          style={{ fontFamily: "var(--my-font)" }}
        >
          <div className="hover:underline hover:duration-500 cursor-pointer" onClick={() => navigate("/choose-topic")}>Interview</div>
          <div className="hover:underline hover:duration-500 cursor-pointer">Resume Analyzer</div>
          <div className="hover:underline hover:duration-500 cursor-pointer">About</div>
        </div>

        <div className="hidden md:flex gap-4 justify-end w-[150px]" style={{ fontFamily: "var(--my-font)" }}>
          {!id ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="cursor-pointer hover:scale-110 transition delay-150 duration-300 hover:bg-gray-100"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="cursor-pointer hover:scale-110 transition delay-150 duration-300 hover:bg-gray-100"
              >
                Signup
              </button>
            </>
          ) : (
            <div
              className="cursor-pointer hover:scale-110 transition duration-300 flex items-center gap-2"
              
            >
              <UserCircle size={32} />
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full flex flex-col gap-10 items-center h-screen justify-center relative text-center">
        <div className="flex flex-col justify-center gap-4">
          <h1 className="text-[89px] leading-tight" style={{ fontFamily: "var(--stardom-font)" }}>
            Master Your Next <br /> Interview with AI
          </h1>
          <p className="text-[20px] font-bold" style={{ fontFamily: "var(--my-font)" }}>
            Smart mock interviews. Instant feedback. Get job-ready.
          </p>
        </div>

        <button
          onClick={handleButtonClick}
          type="submit"
          className="group flex justify-center items-center gap-2 px-6 py-3 mx-auto text-lg font-semibold text-white bg-black rounded-full border-2 border-black transition-all duration-300 hover:bg-white hover:text-black"
        >
          {id ? "Start Interview" : "Get Started"}
          <svg
            className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-white group-hover:border-black p-2 rotate-45"
            viewBox="0 0 16 19"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
              className="fill-white group-hover:fill-black transition-colors duration-500"
            />
          </svg>
        </button>
      </div>

      {/* Feature Section */}
      <div className="flex flex-col relative justify-center items-center w-full h-[500px] gap-[10px]">
        <div className="flex flex-col relative justify-items-start gap-[36px] items-center w-full px-10">
          <h1 style={{ fontFamily: "var(--stardom-font)" }} className="text-[46px] leading-1.5">
            Key Features to Elevate Your Interview Game
          </h1>
          <div className="flex justify-center gap-[10px] w-fit items-center relative">
            <div>Feature Frame</div>
            <div>Feature Frame</div>
            <div>Feature Frame</div>
            <div>Feature Frame</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
