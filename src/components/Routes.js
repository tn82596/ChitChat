import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RecentMessages from './pages/RecentMessages';
import CreateChat from "./pages/CreateChat"; 
import ConversationPage from "./pages/ConversationPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/recent-messages" element={<RecentMessages />} />
      <Route path="/conversation/:conversationId" element={<ConversationPage />} />
    </Routes>
  );
};

export default AppRoutes;