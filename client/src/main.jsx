import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Interview from "./InterviewPage"; 
import ChooseTopic from "./ChooseTopic";
import Login from "./Login";
import Register from "./Register";
import Summary from "./Summary";
import { UserContextProvider } from "./UserContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/choose-topic" element={<ChooseTopic />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
);
