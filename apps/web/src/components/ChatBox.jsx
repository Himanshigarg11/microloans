import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import authService from '../services/authService';
import messageService from '../services/messageService';
import { useToast } from '../context/ToastContext';

const ChatBox = ({ loanId }) => {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const fetchMessages = async () => {
    if (!loanId) return;
    try {
      setLoading(true);
      const response = await messageService.getLoanMessages(loanId);
      setMessages(response?.data ?? response ?? []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Optional: Setup polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [loanId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      await messageService.sendMessage({ 
        loanId, 
        message: newMessage
        // senderId now derived on backend
      });
      setNewMessage('');
      fetchMessages(); // Refresh immediately
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Send Failed',
        message: error.friendlyMessage || error.response?.data?.message || error.message || 'Failed to send message.'
      });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
        {messages.length === 0 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
             </div>
             <p className="text-sm font-medium">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
            const isMe = currentUser && String(senderId) === String(currentUser.id || currentUser._id);
            const senderName = msg.senderId?.name || 'User';

            return (
              <div 
                key={msg._id || index} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm break-words ${
                    isMe 
                      ? 'bg-[#174E4F] text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>
                  <div className={`flex gap-1.5 mt-1 px-1 text-[10px] font-bold uppercase tracking-wider ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-gray-900">{isMe ? 'Me' : senderName}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#174E4F] focus:bg-white rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#174E4F]/10"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-[#174E4F] hover:bg-[#0f3636] text-white p-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          aria-label="Send Message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
