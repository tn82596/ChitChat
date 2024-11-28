import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode as jwt_decode } from 'jwt-decode'; // Import jwt-decode to extract user ID
import '../../styles/RecentMessages.css';

const RecentMessages = () => {
  const [conversations, setConversations] = useState([]);
  
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        // Ensure the token exists before proceeding
        if (!token) {
          console.error('No token found');
          return;
        }

        // Decode the token to get the user ID
        const decodedToken = jwt_decode(token);
        const userID = decodedToken.userID; // Replace `userID` with the actual key that contains the user ID in your token payload

        // Make API request to fetch the user's conversations
        const response = await axios.get(`http://localhost:5001/api/conversations/${userID}`, {
          headers: {
            Authorization: `Bearer ${token}` // Send the token as part of the Authorization header
          }
        });

        // Set the fetched conversations in the component state
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    // Call the function to fetch conversations
    fetchConversations();
  }, []); // Empty dependency array to run this only once when the component mounts

  return (
    <div className="recent-messages">
      <h1>Recent Messages</h1>
      {conversations.length === 0 ? (
        <p>No conversations found.</p>
      ) : (
        conversations.map((conversation) => (
          <div key={conversation._id} className="conversation-item">
            <div className="conversation-info">
              <div className="conversation-name">Participants: {conversation.participants.join(', ')}</div>
              <div className="conversation-last-message">
                {conversation.lastMessage ? conversation.lastMessage.content : "No messages yet."}
              </div>
            </div>
            <div className="conversation-time">
              {conversation.lastMessage ? new Date(conversation.lastMessage.timestamp).toLocaleTimeString() : ''}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentMessages;
