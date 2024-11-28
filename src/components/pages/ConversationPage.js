import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // For accessing route parameters
import axios from 'axios';
import '../../styles/ConversationPage.css'; // Assume you have a CSS file for styling


const ConversationPage = () => {
 const { conversationId } = useParams(); // Get conversationId from URL
 const [messages, setMessages] = useState([]);
 const [newMessage, setNewMessage] = useState('');
 const [error, setError] = useState(null);


 // Fetch messages for a specific conversation
 useEffect(() => {
   const fetchMessages = async () => {
     try {
       const token = localStorage.getItem('token');
       if (!token) {
         console.error('No token found');
         return;
       }


       const response = await axios.get(
         `http://localhost:5001/api/messages/${conversationId}`,
         {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         }
       );


       setMessages(response.data);
     } catch (err) {
       console.error('Error fetching messages:', err);
       setError('Failed to load messages. Please try again.');
     }
   };


   fetchMessages();
 }, [conversationId]);


 // Handle sending a new message
 const handleSendMessage = async () => {
   try {
     const token = localStorage.getItem('token');
     if (!token) {
       console.error('No token found');
       return;
     }


     const response = await axios.post(
       'http://localhost:5001/api/messages',
       {
         conversationId,
         content: newMessage,
       },
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
     );


     setMessages((prevMessages) => [response.data, ...prevMessages]);
     setNewMessage(''); // Clear the input field
   } catch (err) {
     console.error('Error sending message:', err);
     setError('Failed to send message. Please try again.');
   }
 };


 return (
   <div className="conversation-page">
     <h1>Conversation</h1>


     {/* Display error if any */}
     {error && <div className="error-message">{error}</div>}


     {/* Messages List */}
     <div className="messages-list">
       {messages.length === 0 ? (
         <p>No messages yet in this conversation.</p>
       ) : (
         messages.map((message) => (
           <div key={message._id} className="message-item">
             <p>
               <strong>{message.sender}</strong>: {message.content}
             </p>
             <span>{new Date(message.timestamp).toLocaleString()}</span>
           </div>
         ))
       )}
     </div>


     {/* New Message Input */}
     <div className="new-message">
       <textarea
         value={newMessage}
         onChange={(e) => setNewMessage(e.target.value)}
         placeholder="Type a message..."
       />
       <button onClick={handleSendMessage}>Send</button>
     </div>
   </div>
 );
};


export default ConversationPage;