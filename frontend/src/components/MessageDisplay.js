// frontend/src/components/MessageDisplay.js
import React from 'react';

const MessageDisplay = ({ msg, type = 'info' }) => {
  if (!msg) return null;

  const bgColor = type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';

  return (
    <div className={`mt-4 p-3 rounded-lg text-center ${bgColor} ${textColor}`}>
      {msg}
    </div>
  );
};

export default MessageDisplay;  