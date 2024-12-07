// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import { useParams, useNavigate } from 'react-router-dom';
// import io from 'socket.io-client'; // Import Socket.IO client
// import '../../styles/ConversationPage.css';

// const socket = io("http://localhost:5001"); // Connect to the backend

// const themes = {
//   default: "#f9f9f9", // Original white background
//   dark: "#707f90", // Dark theme
//   blue: "#d1e7ff", // Light blue theme
// };



// const ConversationPage = () => {
//   const { convoID } = useParams();
//   const navigate = useNavigate();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [userID, setUserID] = useState(null);
//   const [userNames, setUserNames] = useState({});
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [contextMenu, setContextMenu] = useState(null); // To store the message's context menu position
//   const [theme, setTheme] = useState('default'); // State for selected theme
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const messagesEndRef = useRef(null);
//   const isInitialLoad = useRef(true);

//   // Fetch messages when conversation is selected
//   const fetchMessages = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.error('No token found');
//         return;
//       }

//       const decodedToken = jwtDecode(token);
//       setUserID(decodedToken.id);

//       const response = await axios.get(`http://localhost:5001/messages/${convoID}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const sortedMessages = response.data.sort(
//         (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
//       );

//       setMessages(sortedMessages);

//       // Get unique senders for name fetching
//       const uniqueSenderIDs = [...new Set(sortedMessages.map((msg) => msg.sender))];
//       const fetchedNames = {};
//       await Promise.all(
//         uniqueSenderIDs.map(async (senderID) => {
//           if (senderID !== decodedToken.id) {
//             const response = await axios.get(`http://localhost:5001/user/name/${senderID}`, {
//               headers: { Authorization: `Bearer ${token}` },
//             });
//             fetchedNames[senderID] = response.data.name;
//           } else {
//             fetchedNames[senderID] = 'You';
//           }
//         })
//       );
//       setUserNames(fetchedNames);
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//     }
//   };

//   useEffect(() => {
//     if (convoID) {
//       fetchMessages().then(() => {
//         if (isInitialLoad.current) {
//           scrollToBottom();
//           isInitialLoad.current = false;
//         }
//       });

//       socket.emit("joinConversation", convoID);  // Join the conversation on socket

//       // Listen for conversation updates 
//       socket.on("updateConversation", () => {
//         isInitialLoad.current = false;
//         fetchMessages();
//       });

//     }

//     return () => {
//       socket.off("updateConversation");
//     };
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
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const message = response.data;

//       socket.emit("conversationUpdated", message.conversationId);  // Emit the message to others in the conversation

//       setNewMessage('');
//       scrollToBottom();
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   };

//   const handleDeleteMessage = async (messageID) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.error('No token found');
//         return;
//       }

//       await axios.delete(`http://localhost:5001/messages/${messageID}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       socket.emit("conversationUpdated", convoID);  // Emit the message deletion
//       setContextMenu(null); // Close the context menu after deletion
//       console.log("Message deleted");
//     } catch (error) {
//       console.error('Error deleting message:', error.response ? error.response.data : error);
//     }
//   };


//   const handleSearch = async () => {
//     if (!searchQuery.trim()) return;

//     try {
//       setIsSearching(true);
//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.error('No token found');
//         return;
//       }

//       try {
//         const response = await axios.get(
//           `http://localhost:5001/messages/search/${convoID}?query=${encodeURIComponent(searchQuery)}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setSearchResults(response.data);
//       } catch (error) {
//         if (error.response && error.response.status === 404) {
//           setSearchResults({ message: "No messages found matching the search." });
//         }
//       }
//     } catch (error) {
//       console.error('Error searching messages:', error);
//       setSearchResults([]);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSignOut = () => {
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleContextMenu = (e, messageID) => {
//     e.preventDefault();
//     setContextMenu({
//       x: e.clientX,
//       y: e.clientY,
//       messageID: messageID, // Store the message ID for later use
//     });
//   };

//   const closeContextMenu = () => {
//     setContextMenu(null);
//   };

//   const handleThemeChange = (event) => {
//     setTheme(event.target.value);
//   };

//   const handleReaction = async (messageId, reaction) => {
//       const token = localStorage.getItem('token');
//       try {
//         const response = await axios.put(`http://localhost:5001/messages/react/${messageId}`, 
//           { reaction },
//           { headers: { Authorization: `Bearer ${token}` } } 
//         );
    
//         const updatedMessage = response.data;
    
//         // Update the local message state
//         setMessages((prevMessages) =>
//           prevMessages.map((message) =>
//             message._id === updatedMessage._id ? updatedMessage : message
//           )
//         );
//       } catch (error) {
//         console.error("Failed to update reaction:", error.response?.data || error.message);
//       }
    
//   };

//   const toggleReactions = (messageId) => {
//     setSelectedMessage(selectedMessage === messageId ? null : messageId);
//   };

//   return (
//     <div className="conversation-page" onClick={closeContextMenu}>
//       <button className="sign-out-button" onClick={handleSignOut}>
//         Sign Out
//       </button>

//       <h2 className="conversation-title">Conversation</h2>

//       <button className="go-back-button" onClick={() => navigate('/recent-messages')}>
//         Go Back
//       </button>

//       <div className="search-container">
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Search messages..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//         <button className="search-button" onClick={handleSearch} disabled={isSearching}>
//           {isSearching ? 'Searching...' : 'Search'}
//         </button>
//       </div>

//       <div
//         className="messages-container"
//         style={{ backgroundColor: themes[theme] }} // Dynamic theme background
//       >
//         {isSearching ? (
//           <p>Searching...</p>
//         ) : searchResults.message ? (
//           <div className="search-results">
//             <h3 className="search-title">No search results</h3>
//           </div>
//         ) : searchResults.length > 0 ? (
//           <div className="search-results">
//             <h3 className="search-title">Search Results</h3>
//             {searchResults.map((message) => (
//               <div
//                 key={message._id}
//                 className="search-message-item"
//                 onClick={() => navigate(`/search/${message._id}`)} // Navigate to search page
//                 style={{ cursor: 'pointer' }}
//               >
//                 <div className="search-message-header">
//                   <span className="search-message-sender">{userNames[message.sender]}</span>
//                   <span className="search-message-timestamp">
//                     {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </span>
//                 </div>
//                 <div className="search-message-content">
//                   {message.content}
//                 </div>
//                 <hr className="search-divider" />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="messages-list">
//             {messages.map((message) => (
//               <div
//                 key={message._id}
//                 className={`message-item ${message.sender === userID ? 'sent' : 'received'}`}
//                 onContextMenu={(e) => handleContextMenu(e, message._id)}
//                 onClick={() => toggleReactions(message._id)}
//               >
//                 <div className={`message-sender ${message.sender === userID ? 'sent-name' : 'received-name'}`}>
//                   {userNames[message.sender]}
//                 </div>
//                 {selectedMessage === message._id && (
//                   <div className="reactions-container">
//                     <button onClick={() => handleReaction(message._id, 'love')} className="reaction-button">❤️{message.reactions.love.length}</button>
//                     <button onClick={() => handleReaction(message._id, 'like')} className="reaction-button">👍{message.reactions.like.length}</button>
//                     <button onClick={() => handleReaction(message._id, 'dislike')} className="reaction-button">👎{message.reactions.dislike.length}</button>
//                   </div>
//                 )}
//                 <div className="message-content">
//                   {message.content}
//                 </div>
//                 <div className="message-timestamp">
//                   {new Date(message.timestamp).toLocaleString()}
//                 </div>

                
//               </div>
//             ))}
//             <div ref={messagesEndRef}></div>
//           </div>
//         )}
//       </div>

//       {/* Theme Selector */}
//       <div className="theme-selector">
//         <label htmlFor="theme">Select Theme:</label>
//         <select id="theme" value={theme} onChange={handleThemeChange}>
//           <option value="default">Light</option>
//           <option value="dark">Dark</option>
//           <option value="blue">Blue</option>
//         </select>
//       </div>

//       {/* Delete Button context menu */}
//       {contextMenu && (
//         <div
//           className="delete-context-menu"
//           style={{ top: contextMenu.y, left: contextMenu.x }}
//           onClick={() => handleDeleteMessage(contextMenu.messageID)}
//         >
//           <button>Delete</button>
//         </div>
//       )}

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

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import '../../styles/ConversationPage.css';

const socket = io("http://localhost:5001");

const themes = {
  default: "#f9f9f9",
  dark: "#707f90",
  blue: "#d1e7ff",
};

const ConversationPage = () => {
  const { convoID } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userID, setUserID] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  
  // Edit message states
  const [isEditing, setIsEditing] = useState(false);
  const [editMessageID, setEditMessageID] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  const [theme, setTheme] = useState('default');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const isInitialLoad = useRef(true);

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

      // Get unique sender IDs for name fetching
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

  useEffect(() => {
    if (convoID) {
      fetchMessages().then(() => {
        if (isInitialLoad.current) {
          scrollToBottom();
          isInitialLoad.current = false;
        }
      });

      socket.emit("joinConversation", convoID);

      socket.on("updateConversation", () => {
        isInitialLoad.current = false;
        fetchMessages();
      });
    }

    return () => {
      socket.off("updateConversation");
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
      socket.emit("conversationUpdated", message.conversationId);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageID) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.delete(`http://localhost:5001/messages/${messageID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socket.emit("conversationUpdated", convoID);
      setContextMenu(null);
      console.log("Message deleted");
    } catch (error) {
      console.error('Error deleting message:', error.response ? error.response.data : error);
    }
  };
  
  // New: Handle editing a message
  const handleEditMessage = (messageID) => {
    // Find the message content
    const messageToEdit = messages.find((msg) => msg._id === messageID);
    if (!messageToEdit) return;

    setEditMessageID(messageID);
    setEditMessageContent(messageToEdit.content);
    setIsEditing(true);
    setContextMenu(null); // Close the context menu
  };

  const submitEditedMessage = async () => {
    if (!editMessageContent.trim()) return; // No empty edits

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Call edit API
      await axios.put(
        `http://localhost:5001/messages/edit/${editMessageID}`,
        { content: editMessageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // After successful edit, update UI
      socket.emit("conversationUpdated", convoID);

      // Reset editing states
      setIsEditing(false);
      setEditMessageID(null);
      setEditMessageContent('');
    } catch (error) {
      console.error('Error editing message:', error.response ? error.response.data : error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5001/messages/search/${convoID}?query=${encodeURIComponent(searchQuery)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSearchResults(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setSearchResults({ message: "No messages found matching the search." });
        }
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContextMenu = (e, messageID) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageID: messageID
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  const handleReaction = async (messageId, reaction) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `http://localhost:5001/messages/react/${messageId}`,
        { reaction },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("conversationUpdated", convoID);
      const updatedMessage = response.data;

      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message._id === updatedMessage._id ? updatedMessage : message
        )
      );
    } catch (error) {
      console.error("Failed to update reaction:", error.response?.data || error.message);
    }
  };

  const toggleReactions = (messageId) => {
    setSelectedMessage(selectedMessage === messageId ? null : messageId);
  };

  return (
    <div className="conversation-page" onClick={closeContextMenu}>
      <button className="sign-out-button" onClick={handleSignOut}>
        Sign Out
      </button>

      <h2 className="conversation-title">Conversation</h2>

      <button className="go-back-button" onClick={() => navigate('/recent-messages')}>
        Go Back
      </button>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div
        className="messages-container"
        style={{ backgroundColor: themes[theme] }}
      >
        {isSearching ? (
          <p>Searching...</p>
        ) : searchResults.message ? (
          <div className="search-results">
            <h3 className="search-title">No search results</h3>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="search-results">
            <h3 className="search-title">Search Results</h3>
            {searchResults.map((message) => (
              <div
                key={message._id}
                className="search-message-item"
                onClick={() => navigate(`/search/${message._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="search-message-header">
                  <span className="search-message-sender">{userNames[message.sender]}</span>
                  <span className="search-message-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="search-message-content">
                  {message.content}
                </div>
                <hr className="search-divider" />
              </div>
            ))}
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`message-item ${message.sender === userID ? 'sent' : 'received'}`}
                onContextMenu={(e) => handleContextMenu(e, message._id)}
                onClick={() => toggleReactions(message._id)}
              >
                <div className={`message-sender ${message.sender === userID ? 'sent-name' : 'received-name'}`}>
                  {userNames[message.sender]}
                </div>
                {selectedMessage === message._id && (
                  <div className="reactions-container">
                    <button onClick={() => handleReaction(message._id, 'love')} className="reaction-button">❤️{message.reactions.love.length}</button>
                    <button onClick={() => handleReaction(message._id, 'like')} className="reaction-button">👍{message.reactions.like.length}</button>
                    <button onClick={() => handleReaction(message._id, 'dislike')} className="reaction-button">👎{message.reactions.dislike.length}</button>
                  </div>
                )}
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

      <div className="theme-selector">
        <label htmlFor="theme">Select Theme:</label>
        <select id="theme" value={theme} onChange={handleThemeChange}>
          <option value="default">Light</option>
          <option value="dark">Dark</option>
          <option value="blue">Blue</option>
        </select>
      </div>

      {/* Context menu for Delete/Edit */}
      {contextMenu && (
        <div
          className="delete-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button className="edit-button" onClick={() => handleEditMessage(contextMenu.messageID)}>
            Edit
          </button>
          <button className="delete-button" onClick={() => handleDeleteMessage(contextMenu.messageID)}>
            Delete
          </button>
        </div>
      )}

      {isEditing && (
        <div className="edit-message-container">
          <textarea
            className="edit-message-input"
            value={editMessageContent}
            onChange={(e) => setEditMessageContent(e.target.value)}
          />
          <button 
            className="save-button" 
            onClick={submitEditedMessage} 
            disabled={!editMessageContent.trim()}
          >
            Save
          </button>
          <button 
            className="cancel-button" 
            onClick={() => { setIsEditing(false); setEditMessageID(null); setEditMessageContent(''); }}
          >
            Cancel
          </button>
        </div>
      )}

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
