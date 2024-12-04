import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../../styles/RecentMessages.css';
import { useNavigate } from 'react-router-dom';

const RecentMessages = () => {
    const [conversations, setConversations] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    let userID = null;

    if (token) {
        const decodedToken = jwtDecode(token);
        userID = decodedToken.id; // Extract the user ID from the token
    }

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                if (!token) {
                    console.error('No token found');
                    navigate('/login');
                    return;
                }

                // Fetch all conversations
                const response = await axios.get(`http://localhost:5001/conversations/${userID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Fetch names for each participant in conversations
                const updatedConversations = await Promise.all(
                    response.data.map(async (conversation) => {
                        const participantNames = await Promise.all(
                            conversation.participants.map(async (participantID) => {
                                if (participantID === userID) return 'You';
                                try {
                                    const participantResponse = await axios.get(
                                        `http://localhost:5001/user/name/${participantID}`,
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );
                                    return participantResponse.data.name;
                                } catch (error) {
                                    console.error(
                                        `Error fetching name for user ID ${participantID}:`,
                                        error
                                    );
                                    return participantID; // Fallback to showing the ID in case of error
                                }
                            })
                        );

                        return {
                            ...conversation,
                            participantNames,
                        };
                    })
                );

                setConversations(updatedConversations);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchConversations();
    }, [navigate, token, userID]);

    // Handle click to create a new chat
    const handleCreateNewChat = () => {
        navigate('/create-chat');
    };

    // Handle click on a conversation
    const handleConversationClick = (convoID) => {
        navigate(`/conversation/${convoID}`);
    };

    return (
        <div className="message-container">
            <h1 className="message-title">Recent Messages</h1>
            <div className="chat-list">
                {conversations.length === 0 ? (
                    <p>No conversations found.</p>
                ) : (
                    conversations.map((conversation) => {
                        const lastMessage = conversation.lastMessage;
    
                        // Get participant names for display
                        const participantNames = conversation.participantNames.join(', ');
    
                        // Prepare the preview of the last message
                        let messagePreview = '';
                        if (lastMessage) {
                            if (lastMessage.sender === userID) {
                                messagePreview = `You: ${lastMessage.content}`;
                            } else {
                                messagePreview = lastMessage.content;
                            }
                        } else {
                            messagePreview = 'No messages yet.';
                        }
    
                        return (
                            <div
                                key={conversation._id}
                                className="chat-item"
                                onClick={() => handleConversationClick(conversation._id)}
                            >
                                <div className="conversation-info">
                                    <div className="conversation-name">{participantNames}</div>
                                    <div className="conversation-last-message">{messagePreview}</div>
                                </div>
                                <div className="conversation-time">
                                    {lastMessage
                                        ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : ''}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <button className="login-button" onClick={handleCreateNewChat}>
                Create New Chat
            </button>
        </div>
    );
    
};

export default RecentMessages;
