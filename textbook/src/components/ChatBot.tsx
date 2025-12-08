"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatWithBackend, askSelectionWithBackend, getHistory, sendFeedback } from '../lib/chatApi';

interface Message {
  message_id?: string;
  text: string;
  sender: 'user' | 'bot';
  isError?: boolean;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let storedSessionId = localStorage.getItem('chat_session_id');
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem('chat_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);

    const fetchHistory = async (sid: string) => {
      try {
        const history = await getHistory(sid);
        if (history && history.length > 0) {
          const mappedHistory: Message[] = history.map((msg: any) => ({
            message_id: msg.message_id,
            text: msg.text,
            sender: msg.sender,
          }));
          setMessages(mappedHistory);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
    };

    if (storedSessionId) {
      fetchHistory(storedSessionId);
    }
  }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !sessionId) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      let botResponse;
      if (selectedText) {
        botResponse = await askSelectionWithBackend(selectedText, input, sessionId);
        setSelectedText('');
      } else {
        botResponse = await chatWithBackend(input, sessionId);
      }
      
      const botMessage: Message = { 
        message_id: botResponse.message_id,
        text: botResponse.answer || "No answer found.", 
        sender: 'bot' 
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('API Error:', error);
      const errorMessage: Message = {
        text: `Error: ${error.message || 'Something went wrong.'}`,
        sender: 'bot',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) {
      setSelectedText(selection);
      alert(`Selected text: "${selection}"\nNow ask a question related to this selection.`);
    } else {
      setSelectedText('');
    }
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      await sendFeedback(messageId, rating);
      // Optionally, provide user feedback that the feedback was sent.
      console.log('Feedback sent successfully');
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '600px',
      margin: '20px auto',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '16px', color: '#333' }}>Textbook AI Assistant</h2>
      <div style={{
        flexGrow: 1,
        height: '300px',
        overflowY: 'auto',
        border: '1px solid #eee',
        borderRadius: '4px',
        padding: '8px',
        marginBottom: '16px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              backgroundColor: msg.sender === 'user' ? '#dcf8c6' : (msg.isError ? '#ffdddd' : '#f1f1f1'),
              borderRadius: '12px',
              padding: '10px 14px',
              maxWidth: '100%', // Let the container control the width
              wordBreak: 'break-word',
              color: msg.isError ? '#cc0000' : '#333'
            }}>
              {msg.text}
            </div>
            {msg.sender === 'bot' && !msg.isError && msg.message_id && (
              <div style={{ marginTop: '4px', display: 'flex', gap: '4px' }}>
                <button onClick={() => handleFeedback(msg.message_id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>👍</button>
                <button onClick={() => handleFeedback(msg.message_id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>👎</button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: '#f1f1f1', borderRadius: '12px', padding: '10px 14px' }}>
            Typing...
          </div>
        )}
      </div>
      {selectedText && (
        <div style={{
          backgroundColor: '#ffeeba',
          border: '1px solid #ffcb6b',
          borderRadius: '4px',
          padding: '8px',
          marginBottom: '10px',
          fontSize: '0.9em'
        }}>
          Selected: "<em>{selectedText.substring(0, 100)}...</em>"
          <button onClick={() => setSelectedText('')} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}>x</button>
        </div>
      )}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={selectedText ? 'Ask about the selected text...' : 'Ask a question...'}
          disabled={loading}
          style={{
            flexGrow: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 15px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Send
        </button>
      </form>
      <button
        onClick={handleTextSelection}
        disabled={loading}
        style={{
          marginTop: '10px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '10px 15px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Select Text from Page
      </button>
    </div>
  );
};

export default ChatBot;
