import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useParams } from 'react-router-dom';
import '../../styles/ConversationPage.css';

const ConversationPage = () => {
  const { convoID } = useParams(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userID, setUserID] = useState(null);
  const messagesEndRef = useRef(null); // Reference to the bottom of the message list

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

        // Sort messages by timestamp (ascending order)
        const sortedMessages = response.data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
        scrollToBottom(); // Scroll to the bottom after fetching messages
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if(convoID){
      fetchMessages();
    }
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
          recipientId: null, // Assuming no explicit recipient needed for the conversation
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add the new message to the UI and scroll to the bottom
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
                className={`message-item ${message.sender === userID ? 'sent' : 'received'}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            {/* Dummy div to ensure scrolling to the bottom */}
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
