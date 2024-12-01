import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to extract user ID
import '../../styles/ConversationPage.css'; // Assuming you are using a separate CSS file for styles

const ConversationPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(''); // For the new message input
  const convoID = '67444adb2b1d145bdccdb098'; // Hardcoded convoID for testing

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        // Fetch messages
        const response = await axios.get(`http://localhost:5001/messages/${convoID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [convoID]);

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const decodedToken = jwtDecode(token);
      const userID = decodedToken.userID;

      const response = await axios.post(
        `http://localhost:5001/messages`,
        {
          conversationId: convoID,
          content: newMessage,
          recipientId: null, // Assuming no explicit recipient needed for the conversation
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add the new message to the UI
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage(''); // Clear the input field
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="conversation-page">
      <h1 className="conversation-title">Conversation</h1>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <p>No messages in this conversation.</p>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`message-item ${message.sender === message._id ? 'sent' : 'received'}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
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
