import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/ConversationPage.css';

const SearchPage = () => {
  const { messageID } = useParams(); // Extract messageID from the route parameters
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [userID, setUserID] = useState(null);
  const [userNames, setUserNames] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchSurroundingMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const decodedToken = jwtDecode(token);
        setUserID(decodedToken.id);

        // Fetch surrounding messages for the given messageID
        const response = await axios.get(`http://localhost:5001/messages/findSurrounding/${messageID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedMessages = response.data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        setMessages(sortedMessages);

        // Fetch user names for each sender
        const uniqueSenderIDs = [...new Set(sortedMessages.map((msg) => msg.sender))];
        const fetchedNames = {};
        await Promise.all(
          uniqueSenderIDs.map(async (senderID) => {
            if (senderID !== decodedToken.id) {
              const response = await axios.get(`http://localhost:5001/user/name/${senderID}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchedNames[senderID] = response.data.name;
            } else {
              fetchedNames[senderID] = 'You';
            }
          })
        );
        setUserNames(fetchedNames);
      } catch (error) {
        console.error('Error fetching surrounding messages:', error);
      }
    };

    if (messageID) {
      fetchSurroundingMessages();
    }
  }, [messageID]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="conversation-page">
      <button className="go-back-button" onClick={() => navigate(-1)}>
        Go Back
      </button>

      <h2 className="conversation-title">Surrounding Messages</h2>

      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => (
            <div key={message._id} className={`message-item ${message.sender === userID ? 'sent' : 'received'}`}>
              <div className={`message-sender ${message.sender === userID ? 'sent-name' : 'received-name'}`}>
                {userNames[message.sender]}
              </div>
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-timestamp">
                {new Date(message.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
