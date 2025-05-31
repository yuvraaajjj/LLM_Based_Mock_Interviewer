import React from "react";
import { useNavigate } from "react-router-dom";

const topics = [
  { name: "Software Engineer", description: "Master algorithms and complexity." },
  { name: "Data Analyst", description: "Dive into process management and memory." },
  { name: "DevOps", description: "Ace your database management skills." },
  { name: "Full Stack Developer", description: "Solidify your object-oriented programming basics." },
  { name: "Networking", description: "Understand how computers communicate." },
];

function ChooseTopic() {
  const navigate = useNavigate();

  const startInterview = (topic) => {
    navigate("/interview", { state: { topic } });
  };

  return (  
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-10" style={{ fontFamily: "var(--stardom-font)" }}>
        Choose Your Interview Topic
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <div
            key={topic.name}
            onClick={() => startInterview(topic.name)}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transform hover:scale-105 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{topic.name}</h2>
            <p className="text-gray-600">{topic.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChooseTopic;
