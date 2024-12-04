import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client'; // Import Socket.IO client
import '../../styles/ConversationPage.css';

const socket = io("http://localhost:5001"); // Connect to the backend

const ConversationPage = () => {
  const { convoID } = useParams();
  const navigate = useNavigate(); // Use navigate to handle navigation
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userID, setUserID] = useState(null);
  const [userNames, setUserNames] = useState({}); // Store sender names here
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const decodedToken = jwtDecode(token);
        setUserID(decodedToken.id);

        const response = await axios.get(`http://localhost:5001/messages/${convoID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedMessages = response.data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        setMessages(sortedMessages);
        scrollToBottom();

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
        console.error('Error fetching messages:', error);
      }
    };

    if (convoID) {
      fetchMessages();
      socket.emit("joinConversation", convoID);
    }

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [convoID]);

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.post(
        `http://localhost:5001/messages`,
        {
          conversationId: convoID,
          content: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const message = response.data;

      socket.emit("sendMessage", message);

      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token'); // Remove the token
    navigate('/login'); // Redirect to the login page
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="conversation-page">
      {/* Sign-Out Button */}
      <button className="sign-out-button" onClick={handleSignOut}>
        Sign Out
      </button>

      <h2 className="conversation-title">Conversation</h2>

      {/* Go Back Button */}
      <button className="go-back-button" onClick={() => navigate('/recent-messages')}>
        Go Back
      </button>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <p>No messages in this conversation.</p>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message._id} className={`message-item ${message.sender === userID ? 'sent' : 'received'}`}>
                <div className={`message-sender ${message.sender === userID ? 'sent-name' : 'received-name'}`}>
                  {userNames[message.sender]}
                </div>
                <div className="message-content">{message.content}</div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <textarea
          className="message-input"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        ></textarea>
        <button className="send-button" onClick={handleSendMessage} disabled={!newMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ConversationPage;
