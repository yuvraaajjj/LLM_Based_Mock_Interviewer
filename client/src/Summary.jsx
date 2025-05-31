import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Summary() {
  const location = useLocation();
  const navigate = useNavigate();
  const summary = location.state?.summary || "No summary available.";
  const topic = location.state?.topic || "Unknown Topic";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center mb-4" style={{ fontFamily: "var(--stardom-font)" }}>
          Interview Summary
        </h1>
        <div className="text-lg text-gray-700 mb-6 text-center">
          Topic: <strong>{topic}</strong>
        </div>
        <div className="bg-green-100 text-green-900 p-4 rounded-md whitespace-pre-wrap font-mono">
          {summary}
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full transition"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate("/choose-topic")}
            className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-full transition"
          >
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default Summary;
