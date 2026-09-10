import React from 'react';
import { Message } from '../types';
import { useAuth } from '../Contexts';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const isMe = message.senderId === user?.id;

  return (
    <div className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
        isMe 
        ? 'bg-pink-600 text-white rounded-br-none' 
        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
      }`}>
        {!isMe && (
          <p className="text-[10px] font-black text-pink-600 mb-1 uppercase tracking-tighter">
            {message.senderName}
          </p>
        )}
        <p className="text-sm font-medium">{message.text}</p>
        <p className={`text-[9px] mt-1 text-right opacity-50`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
