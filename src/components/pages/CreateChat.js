import React, { useState } from "react";
import axios from "axios";

const CreateChat = ({ userId }) => {
    const [recipientEmail, setRecipientEmail] = useState("");
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");

    const handleRecipientSearchOrCreate = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return console.error("No token found");

            // Check or create a conversation with the input email
            const response = await axios.post(
                "http://localhost:5001/conversations",
                { recipientEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setConversation(response.data); // Save the conversation details
            setError("");
        } catch (err) {
            console.error("Error creating or fetching conversation:", err);
            setError(err.response?.data?.message || "Error creating conversation.");
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return console.error("No token found");

            const response = await axios.get(
                `http://localhost:5001/messages/${conversationId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessages(response.data);
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError("Error fetching previous messages.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!recipientEmail) {
            setError("Please enter a recipient email.");
            return;
        }

        // Check for or create the conversation
        await handleRecipientSearchOrCreate();

        if (conversation?._id) {
            // Fetch existing messages if the conversation exists
            await fetchMessages(conversation._id);
        }
    };

    return (
        <div>
            <h2>Create or Continue a Chat</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Recipient Email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                />
                <button type="submit">Start Chat</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {conversation && (
                <div>
                    <h3>Chat with {recipientEmail}</h3>
                    <div>
                        {messages.length > 0 ? (
                            messages.map((message) => (
                                <p key={message._id}>
                                    <strong>{message.sender === userId ? "You" : recipientEmail}:</strong> {message.content}
                                </p>
                            ))
                        ) : (
                            <p>No previous messages.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateChat;
