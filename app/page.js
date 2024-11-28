"use client";
import React, { useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // Format code blocks
  const formatMessage = (text) => {
    if (!text) return "";

    // Replace code blocks with highlighted HTML
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang || "javascript";
      try {
        return `<pre class="language-${language}"><code>${Prism.highlight(
          code,
          Prism.languages[language],
          language
        )}</code></pre>`;
      } catch (err) {
        return `<pre><code>${code}</code></pre>`;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    try {
      const response = await fetch("/api/get_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.response,
        formatted: formatMessage(data.response),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }
    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.sender === "bot" ? (
              <div
                className="formatted-content"
                dangerouslySetInnerHTML={{ __html: message.formatted }}
              />
            ) : (
              <p>{message.text}</p>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the codebase..."
          className="chat-input"
        />
        <button type="submit" className="submit-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
