import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useParams } from 'react-router-dom';
import '../../styles/ConversationPage.css';

// const ConversationPage = () => {
//   const { convoID } = useParams(); 
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [userID, setUserID] = useState(null);
//   const [userNames, setUserNames] = useState({}); // To store user names based on userID
//   const messagesEndRef = useRef(null); // Reference to the bottom of the message list

//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           console.error('No token found');
//           return;
//         }

//         const decodedToken = jwtDecode(token);
//         setUserID(decodedToken.id);

//         const response = await axios.get(`http://localhost:5001/messages/${convoID}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         // Sort messages by timestamp (ascending order)
//         const sortedMessages = response.data.sort(
//           (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
//         );
//         setMessages(sortedMessages);
//         scrollToBottom(); // Scroll to the bottom after fetching messages

//         // Fetch the names of participants
//         const uniqueUserIds = [...new Set(sortedMessages.map(msg => msg.sender))];
//         uniqueUserIds.forEach(async (id) => {
//           try {
//             const nameResponse = await axios.get(`http://localhost:5001/user/name/${id}`, {
//               headers: { Authorization: `Bearer ${token}` },
//             });
//             setUserNames(prev => ({ ...prev, [id]: nameResponse.data.name }));
//           } catch (err) {
//             console.error('Error fetching user name:', err);
//           }
//         });
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//       }
//     };

//     if(convoID){
//       fetchMessages();
//     }
//   }, [convoID]);

//   const handleSendMessage = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.error('No token found');
//         return;
//       }

//       const response = await axios.post(
//         `http://localhost:5001/messages`,
//         {
//           conversationId: convoID,
//           content: newMessage,
//           recipientId: null, // Assuming no explicit recipient needed for the conversation
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Add the new message to the UI and scroll to the bottom
//       setMessages((prevMessages) => [...prevMessages, response.data]);
//       setNewMessage('');
//       scrollToBottom();
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   return (
//     <div className="conversation-page">
//       <h1 className="conversation-title">Conversation</h1>

//       {/* Messages */}
//       <div className="messages-container">
//         {messages.length === 0 ? (
//           <p>No messages in this conversation.</p>
//         ) : (
//           <div className="messages-list">
//             {messages.map((message, index) => {
//               const senderName = userNames[message.sender] || "Loading...";
//               const showSenderName =
//                 index === 0 || message.sender !== messages[index - 1].sender;

//               return (
//                 <div key={message._id}>
//                   {showSenderName && (
//                     <div className="message-sender-name">{senderName}</div>
//                   )}
//                   <div
//                     className={`message-item ${
//                       message.sender === userID ? 'sent' : 'received'
//                     }`}
//                   >
//                     <div className="message-content">{message.content}</div>
//                     <div className="message-timestamp">
//                       {new Date(message.timestamp).toLocaleString()}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//             {/* Dummy div to ensure scrolling to the bottom */}
//             <div ref={messagesEndRef}></div>
//           </div>
//         )}
//       </div>

//       {/* Message Input */}
//       <div className="message-input-container">
//         <textarea
//           className="message-input"
//           placeholder="Type your message..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//         ></textarea>
//         <button className="send-button" onClick={handleSendMessage} disabled={!newMessage.trim()}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ConversationPage;
const ConversationPage = () => {
  const { convoID } = useParams();
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

        // Sort messages by timestamp (ascending order)
        const sortedMessages = response.data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        setMessages(sortedMessages);
        scrollToBottom();

        // Fetch the user names for each sender
        const uniqueSenderIDs = [...new Set(sortedMessages.map(msg => msg.sender))];
        const fetchedNames = {};
        await Promise.all(uniqueSenderIDs.map(async (senderID) => {
          if (senderID !== decodedToken.id) {
            const response = await axios.get(`http://localhost:5001/user/name/${senderID}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchedNames[senderID] = response.data.name;
          } else {
            fetchedNames[senderID] = 'You'; // Assign 'You' for the current user
          }
        }));
        setUserNames(fetchedNames);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (convoID) {
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
            {messages.map((message, index) => (
              <div key={message._id} className={`message-item ${message.sender === userID ? 'sent' : 'received'}`}>
                {/* Display sender name only for received messages or sent messages if explicitly needed */}
                <div className={`message-sender ${message.sender === userID ? 'sent-name' : 'received-name'}`}>
                  {userNames[message.sender]}
                </div>
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