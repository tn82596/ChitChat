import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { jwtDecode as jwt_decode } from 'jwt-decode'; // Import jwt-decode to extract user ID
import { jwtDecode } from 'jwt-decode';
import '../../styles/RecentMessages.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const RecentMessages = () => {
    const [conversations, setConversations] = useState([]);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchConversations = async () => {
        try {
          // Get the token from localStorage
          const token = localStorage.getItem('token');
  
          // Ensure the token exists before proceeding
          if (!token) {
            console.error('No token found');
            navigate('/login'); // Redirect to login if no token is found
            return;
          }
  
          // Decode the token to get the user ID
          const decodedToken = jwtDecode(token);
          const userID = decodedToken.id; // Extract the user ID from the token
  
          // Make API request to fetch the user's conversations
          const response = await axios.get(`http://localhost:5001/conversations/${userID}`, {
            headers: {
              Authorization: `Bearer ${token}` // Send the token as part of the Authorization header
            }
          });
  
          // Debugging: Log response data to see what you receive
          console.log('Fetched conversations:', response.data);
  
          // Set the fetched conversations in the component state
          setConversations(response.data);
        } catch (error) {
          console.error('Error fetching conversations:', error);
        }
      };
  
      // Call the function to fetch conversations
      fetchConversations();
    }, [navigate]); // Add navigate to the dependency array to avoid errors in React
  
    // Handle click to create a new chat
    const handleCreateNewChat = () => {
      navigate('/create-chat'); // Navigate to the create-chat route
    };
  
    // Handle click on a conversation
    const handleConversationClick = (convoID) => {
      navigate(`/conversation/${convoID}`); // Navigate to a specific conversation
    };
  
    const getOtherParticipants = (participants, currentUserID) => {
      return participants.filter(participant => participant !== currentUserID);
    };
  
    return (
      <div className="recent-messages">
        <h1>Recent Messages</h1>
        <button className="create-chat-button" onClick={handleCreateNewChat}>
          Create New Chat
        </button>
        {conversations.length === 0 ? (
          <p>No conversations found.</p>
        ) : (
          conversations.map((conversation) => {
            const lastMessage = conversation.lastMessage;
            const currentUserID = jwtDecode(localStorage.getItem('token')).userID;
  
            // Determine the name(s) of the other participant(s)
            const otherParticipants = getOtherParticipants(conversation.participants, currentUserID);
            const participantNames = otherParticipants.join(', ');
  
            // Prepare the preview of the last message
            let messagePreview = '';
            if (lastMessage) {
              if (lastMessage.sender === currentUserID) {
                messagePreview = `You: ${lastMessage.content}`;
              } else {
                messagePreview = lastMessage.content;
              }
            } else {
              messagePreview = "No messages yet.";
            }
  
            return (
              <div 
                key={conversation._id} 
                className="conversation-item"
                onClick={() => handleConversationClick(conversation._id)} // Add click event to navigate to conversation
              >
                <div className="conversation-info">
                  <div className="conversation-name">{participantNames}</div>
                  <div className="conversation-last-message">{messagePreview}</div>
                </div>
                <div className="conversation-time">
                  {lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };
  
  export default RecentMessages;
