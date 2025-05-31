import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css"
import Mic from "./Components/Mic";

function Interview() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionTopic, setSessionTopic] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusOnline, setStatusOnline] = useState(true);
  const [initialRequestSent, setInitialRequestSent] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkServerStatus();
  }, []);

  // Handle topic from navigation - ONE TIME ONLY
  useEffect(() => {
    const topicFromNav = location.state?.topic;
    
    if (topicFromNav && !initialRequestSent && !sessionTopic) {
      startNewSession(topicFromNav);
    }
  }, [location.state?.topic, initialRequestSent, sessionTopic]);
  
  
  // Extracted session starting logic into a separate function
  const startNewSession = async (topic) => {
    if (isProcessing || initialRequestSent) return;
    
    try {
      setInitialRequestSent(true); // Mark that we're sending the initial request
      
      // Reset session on backend
      await fetch("http://127.0.0.1:5000/reset", { method: "POST" });
      
      // Clear UI state
      setMessages([]);
      setSessionTopic(topic);
      setInput("");
      
      // Initiate the session with the topic
      setIsProcessing(true);
      addMessage(`Starting interview session on: ${topic}`, "system");
      
      console.log("Sending initial chat request with topic:", topic);
      
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ message: "start", topic: topic})
      });
      
      const text = await res.text();
      
      try {
        if (!text.trim()) throw new Error("Empty server response");
        const result = JSON.parse(text);
        
        if (result.question) {
          setIsLoading(true);
          // Delay showing question by 3 seconds to match audio
          setTimeout(() => {
            setQuestion(result.question);
            addMessage(result.question, "bot");
            setIsLoading(false);
          }, 3000);
        }
      } catch (err) {
        addMessage(`⚠️ Error starting session: ${err.message}`, "error");
      } finally {
        setIsProcessing(false);
      }
    } catch (err) {
      addMessage("Error starting new session", "error");
      setIsProcessing(false);
    }
  };

  const checkServerStatus = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/ping");
      setStatusOnline(res.ok);
    } catch {
      setStatusOnline(false);
    }
  };

  const addMessage = (text, type) => {
    setMessages((prev) => [...prev, { text, type }]);
  };

  const sendMessage = async (message) => {
    if (isProcessing || !message.trim()) return;

    addMessage(message, "user");
    setIsProcessing(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ message })
      });

      const text = await res.text();
      let result;

      try {
        if (!text.trim()) throw new Error("Empty server response");
        result = JSON.parse(text);
      } catch (err) {
        addMessage(`⚠️ Error parsing server response: ${err.message}`, "error");
        return;
      }

      if (res.status === 200) {
        if (result.feedback) addMessage(result.feedback, "feedback");
        if (result.nextQuestion) addMessage(result.nextQuestion, "bot");

        if (!result.feedback && !result.nextQuestion) {
          if (result.error) {
            addMessage(result.error, "error");
          } else {
            addMessage(`Let's continue. Could you tell me more about ${sessionTopic}?`, "bot");
          }
        }
      } else {
        addMessage(result.error || "Unknown error", "error");
      }
    } catch (err) {
      addMessage(`Fetch error: ${err.message}. Server might be down.`, "error");
      checkServerStatus();
    } finally {
      setIsProcessing(false);
    }
  };

  const endSession = async () => {
    if (isProcessing || !sessionTopic) {
      addMessage("No active session to end.", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("http://localhost:5000/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      const text = await res.text();
      let result;

      try {
        if (!text.trim()) throw new Error("Empty response");
        result = JSON.parse(text);
      } catch (err) {
        addMessage(`⚠️ Error parsing summary: ${err.message}`, "error");
        return;
      }

      if (res.status === 200 && result.summary) {
      setInitialRequestSent(false);
      setSessionTopic(null);
      addMessage(result.summary, "summary");

      // ✅ Navigate to summary page with state
      navigate("/summary", {
        state: {
          summary: result.summary,
          topic: sessionTopic
        }
      });
    } else {
      console.error("Failed to fetch summary.");
    }
    } catch (err) {
      addMessage(`End session error: ${err.message}`, "error");
      checkServerStatus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = (msg = null) => {
    if (isProcessing) return;
    
    const messageToSend = msg || input.trim();
    if (!messageToSend) return;
  
    if (!sessionTopic && !initialRequestSent) {
      startNewSession(messageToSend);
    } else {
      sendMessage(messageToSend);
    }
  
    setInput("");
  };
  
  
  

  return (
    <div className="max-h-screen w-full px-4 md:px-20 py-10 flex flex-col items-center bg-gray-50">
      <div className="w-full flex justify-between">
        <div className="w-15"></div>
        <div className="flex flex-col items-center mb-6 ">
          <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--stardom-font)" }}>
            Interview In Session
          </h2>
          
          <div className="mb-4 text-lg font-semibold text-gray-700">
            {sessionTopic ? `Topic: ${sessionTopic}` : "Enter a topic to begin your interview session"}
          </div>
        </div>
        <div> 
          <button
            onClick={endSession}
            class="group flex items-center justify-start w-11 h-11 bg-gray-900 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1"
          >
            <div
              class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3"
            >
              <svg class="w-4 h-4" viewBox="0 0 512 512" fill="white">
                <path
                  d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                ></path>
              </svg>
            </div>
            <div
              class="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            >
              End
            </div>
          </button>

        </div>
      </div>

      <div className="w-full max-w-3xl h-[80vh] overflow-y-auto bg-white rounded-xl p-4 shadow-inner space-y-3 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-xl ${
              m.type === "user"
                ? "bg-blue-100 self-end text-right"
                : m.type === "bot"
                ? "bg-gray-200"
                : m.type === "feedback"
                ? "bg-yellow-100"
                : m.type === "summary"
                ? "bg-green-100"
                : m.type === "system"
                ? "bg-gray-100 text-gray-600 italic"
                : "bg-red-100 text-red-600"
            }`}
          >
            {m.type !== "user" && <strong>{m.type.charAt(0).toUpperCase() + m.type.slice(1)}: </strong>}
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {isProcessing && <div className="text-gray-500 italic mb-4">Thinking...</div>}

      <div className="flex justify-between items-center w-full max-w-3xl gap-2 px-4">
        <div className="flex items-center flex-grow bg-white rounded-full shadow px-3 py-1 border">
          <input
            required
            placeholder="Message..."
            type="text"
            id="messageInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isProcessing}
            className="flex-grow bg-transparent outline-none border-none text-black"
          />
          <button onClick={handleSend} disabled={isProcessing} id="sendButton" className="ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663" className="h-5 w-5">
              <path
                fill="none"
                d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
              ></path>
              <path
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="33.67"
                stroke="#6c6c6c"
                d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
              ></path>
            </svg>
          </button>
        </div>
        <Mic onTranscript={(transcript) => {
          setInput(transcript);
          handleSend(transcript);
        }} />

      </div>


      
    </div>
  );
}

export default Interview;