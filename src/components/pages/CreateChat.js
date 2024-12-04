import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateChat.css";

const CreateChat = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null); // State for error messages
  const navigate = useNavigate();

  const handleCreateChat = async () => {
    setError(null); // Reset error messages
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found in local storage. Please log in.");
        return;
      }

      // 1. Get the user ID from the email
      let userIdResponse;
      try {
        userIdResponse = await axios.get(
          `http://localhost:5001/user/id/${email}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        setError(
          "Failed to fetch user ID from email. " +
            (err.response?.data?.message || err.message)
        );
        return;
      }

      if (!userIdResponse.data?.userID) {
        setError("No user ID found for the provided email.");
        return;
      }

      const userID = userIdResponse.data.userID;

      // 2. Get the current user's ID from the token
      let currentUser;
      try {
        currentUser = JSON.parse(atob(token.split(".")[1])).id;
      } catch (err) {
        setError("Error decoding token to fetch current user ID. " + err.message);
        return;
      }

      // 3. Create or fetch the conversation
      let conversationResponse;
      try {
        conversationResponse = await axios.post(
          "http://localhost:5001/conversations",
          { participants: [currentUser, userID] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        setError(
          "Failed to create or fetch the conversation. " +
            (err.response?.data?.message || err.message)
        );
        return;
      }

      if (!conversationResponse.data?._id) {
        setError(
          "Conversation creation succeeded but no conversation ID returned."
        );
        return;
      }

      const conversationID = conversationResponse.data._id;

      // Redirect to the conversation page
      navigate(`/conversation/${conversationID}`);
    } catch (err) {
      setError("An unexpected error occurred: " + err.message);
    }
  };

  return (
    <div className="create-chat">
      <h2>Create a Chat</h2>
      <input
        className="create-chat-input"
        type="email"
        placeholder="Enter user's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="create-chat-button"
        onClick={handleCreateChat}
        disabled={!email.trim()}
      >
        Start Chat
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default CreateChat;
