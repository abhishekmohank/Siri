import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [allChats, setAllChats] = useState([]);
  const [currentChat, setCurrentChat] = useState({ messages: [] });
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch all chat histories when the component mounts
    fetch('/api/chat-history')
      .then(response => response.json())
      .then(data => setAllChats(data));
  }, []);

  const handleSend = () => {
    if (input.trim() && currentChat) {
      const userMessage = { type: 'user', text: input };
      const updatedCurrentChat = { ...currentChat, messages: [...currentChat.messages, userMessage] };
  
      // Update the current chat and all chats
      setCurrentChat(updatedCurrentChat);
      setAllChats(allChats.map(chat => chat.id === currentChat.id ? updatedCurrentChat : chat));
  
      // Call the chat API to get the bot response
      fetch('http://localhost:8000/echo', {  // Adjusted URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),  // Adjusted to match the expected input structure
      })
        .then(response => response.json())
        .then(data => {
          const botMessage = { type: 'bot', text: data.answer };  // Adjusted to match the response structure
          const updatedChat = { ...updatedCurrentChat, messages: [...updatedCurrentChat.messages, botMessage] };
  
          // Update the current chat and all chats
          setCurrentChat(updatedChat);
          setAllChats(allChats.map(chat => chat.id === currentChat.id ? updatedChat : chat));
        });
  
      setInput('');
      setSuggestions([]);
    }
  };
  

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim()) {
        // Fetch suggestions from the backend based on user input
        fetch(`http://localhost:8000/suggestions?query=${encodeURIComponent(value)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Access the nested suggestions array
                const suggestionsArray = data.suggestions.suggestions || [];
                console.log(suggestionsArray)
                setSuggestions(suggestionsArray);
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            });
    } else {
        setSuggestions([]);
    }
};



  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setSuggestions([]);
  };

  const handleNewChat = () => {
    const newChat = { id: Date.now(), messages: [] };
    setAllChats([...allChats, newChat]);
    setCurrentChat(newChat);
  };

  const handleChatClick = (chat) => {
    setCurrentChat(chat);
  };

  const handleDeleteChat = (chatId) => {
    setAllChats(allChats.filter(chat => chat.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat({ messages: [] });
    }
  };

  return (
    <div className="App">
      <div className="sidebar">
        <h2>Past Chats</h2>
        <button className="new-chat-btn" onClick={handleNewChat}>New Chat</button>
        <div className="chat-history">
          {allChats.map(chat => (
            <div key={chat.id} className={`chat-history-item ${chat.id === currentChat?.id ? 'active' : ''}`}>
              <span onClick={() => handleChatClick(chat)}>Chat {chat.id}</span>
              <button className="delete-chat-btn" onClick={() => handleDeleteChat(chat.id)}>×</button>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-container">
        <div className="chat-header">
          <h2>Chat Interface</h2>
        </div>
        <div className="chat-messages">
          {currentChat?.messages?.map((message, index) => (
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
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
