import React from 'react';
import '../../styles/RecentMessages.css';

const conversations = [
  {
    id: 1,
    name: 'Ashley',
    lastMessage: 'matcha derp',
    time: '11:34 PM'
  },
  {
    id: 2,
    name: 'Charline',
    lastMessage: 'boba time',
    time: '11:26 PM'
  },
  {
    id: 3,
    name: 'Chloe',
    lastMessage: 'les play volleyball!',
    time: '11:10 PM'
  },
  {
    id: 4,
    name: 'Theanh',
    lastMessage: 'fade teen',
    time: '10:54 PM'
  }
];

const RecentMessages = () => {
  return (
    <div className="recent-messages">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="conversation-item">
          <div className="conversation-info">
            <div className="conversation-name">{conversation.name}</div>
            <div className="conversation-last-message">{conversation.lastMessage}</div>
          </div>
          <div className="conversation-time">{conversation.time}</div>
        </div>
      ))}
    </div>
  );
};

export default RecentMessages;
