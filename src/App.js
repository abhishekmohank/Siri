import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch chat history when the component mounts
    fetch('/api/chat-history')
      .then(response => response.json())
      .then(data => setMessages(data));
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      const userMessage = { type: 'user', text: input };
      setMessages([...messages, userMessage]);

      // Call the chat API to get the bot response
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
        .then(response => response.json())
        .then(data => {
          setMessages(prevMessages => [
            ...prevMessages,
            { type: 'bot', text: data.response },
          ]);
        });

      setInput('');
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim()) {
      // Fetch suggestions based on user input
      fetch(`/api/suggestions?query=${value}`)
        .then(response => response.json())
        .then(data => setSuggestions(data));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="App">
      <div className="sidebar">
        <h2>Past Chats</h2>
        <button className="new-chat-btn">New Chat</button>
      </div>
      <div className="chat-container">
        <div className="chat-header">
          <h2>Chat Interface</h2>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.type}`}>
              <span>{message.text}</span>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button onClick={handleSend} className="send-btn">Send</button>
        </div>
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
