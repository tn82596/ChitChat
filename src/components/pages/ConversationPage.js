import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to extract user ID
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../../styles/ConversationPage.css'; // Assuming you are using a separate CSS file for styles

const ConversationPage = () => {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate(); // Use navigate for navigation
  const convoID = '67444adb2b1d145bdccdb098'; // Hardcoded convoID for testing
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        // Ensure the token exists before proceeding
        if (!token) {
          console.error('No token found');
          return;
        }

        // Decode the token to get the user ID (optional, if needed)
        const decodedToken = jwtDecode(token);
        const userID = decodedToken.userID; // Replace `userID` with the actual key in your token

        // Make the API request to fetch messages for the specific conversation (convoID)
        const response = await axios.get(`http://localhost:5001/messages/${convoID}`, {
          headers: {
            Authorization: `Bearer ${token}` // Send the token as part of the Authorization header
          }
        });

        // Set the fetched messages in the component state
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Call the function to fetch messages when the component mounts
    fetchMessages();
  }, [convoID]); // Trigger useEffect on mount or when convoID changes

  return (
    <div className="conversation-page">
      <h1 className="conversation-title">Conversation</h1>
      <div className="messages-container">
        {messages.length === 0 ? (
          <p>No messages in this conversation.</p>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message._id} className={`message-item ${message.sender === message._id ? 'sent' : 'received'}`}>
                <div className="message-content">
                  <strong>{message.sender.name}:</strong> {message.content}
                </div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
