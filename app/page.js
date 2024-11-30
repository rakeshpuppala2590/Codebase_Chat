"use client";
import React, { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import Sidebar from "./components/Sidebar";
import { supabase } from "./utils/supabase";
import MultiNamespaceSelector from "./components/MultiNamespaceSelector";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState(null);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [selectedMultiNamespaces, setSelectedMultiNamespaces] = useState([]);
  const [isMultiChat, setIsMultiChat] = useState(false);

  const handleMultiNamespaceSelect = (namespace) => {
    setSelectedMultiNamespaces((prev) =>
      prev.includes(namespace)
        ? prev.filter((ns) => ns !== namespace)
        : [...prev, namespace]
    );
  };

  const handleStartMultiChat = () => {
    setIsMultiChat(true);
    setShowMultiSelect(false);
  };

  useEffect(() => {
    fetchNamespaces();
  }, []);

  useEffect(() => {
    if (selectedNamespace) {
      fetchChatHistory(selectedNamespace);
    }
  }, [selectedNamespace]);

  const fetchChatHistory = async (namespace) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("namespace", namespace)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages((prev) => ({
        ...prev,
        [namespace]: data,
      }));
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const fetchNamespaces = async () => {
    try {
      const response = await fetch("/api/get_namespaces");
      const data = await response.json();
      setNamespaces(data.namespaces);
      if (data.namespaces.length > 0) {
        setSelectedNamespace(data.namespaces[0]);
      }
    } catch (error) {
      console.error("Error fetching namespaces:", error);
    }
  };

  const handleNamespaceSelect = (namespace) => {
    setSelectedNamespace(namespace);
  };

  // Format code blocks
  // Format code blocks
  const formatMessage = (text) => {
    if (!text) return "";

    // Ensure Prism is loaded in the browser environment
    if (typeof window !== "undefined") {
      Prism.highlightAll();
    }

    // Process Markdown-style code blocks
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        const language = lang || "javascript";
        const highlightedCode = Prism.highlight(
          code.trim(),
          Prism.languages[language] || Prism.languages.javascript,
          language
        );
        return `<pre class="language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>`;
      })
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold text
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // italic text
      .replace(/\~\~(.*?)\~\~/g, "<del>$1</del>"); // strikethrough text
  };

  const handleMultiSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || selectedMultiNamespaces.length === 0) return;

    const userMessage = {
      sender: "user",
      text: input,
      namespaces: selectedMultiNamespaces,
      created_at: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/get_multi_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input,
          namespaces: selectedMultiNamespaces,
        }),
      });

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: data.response,
        namespaces: selectedMultiNamespaces,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }
    setInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedNamespace) return;

    const userMessage = {
      sender: "user",
      text: input,
      namespace: selectedNamespace,
    };
    // setMessages((prev) => ({
    //   ...prev,
    //   [selectedNamespace]: [...(prev[selectedNamespace] || []), userMessage],
    // }));

    try {
      // Insert user message
      const { error: userError } = await supabase
        .from("messages")
        .insert(userMessage);

      if (userError) throw userError;

      // Update UI
      setMessages((prev) => ({
        ...prev,
        [selectedNamespace]: [...(prev[selectedNamespace] || []), userMessage],
      }));
      const response = await fetch("/api/get_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input,
          namespace: selectedNamespace,
        }),
      });
      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.response,
        formatted: formatMessage(data.response),
        namespace: selectedNamespace,
      };

      // Insert bot message
      const { error: botError } = await supabase
        .from("messages")
        .insert(botMessage);

      if (botError) throw botError;

      setMessages((prev) => ({
        ...prev,
        [selectedNamespace]: [...(prev[selectedNamespace] || []), botMessage],
      }));
    } catch (error) {
      console.error("Error:", error);
    }
    setInput("");
  };

  return (
    <div className="app-container">
      <Sidebar
        namespaces={namespaces}
        selectedNamespace={selectedNamespace}
        onSelect={handleNamespaceSelect}
      />
      <div className="flex-1">
        <div className="p-4 border-b">
          <button
            onClick={() => setShowMultiSelect(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Start Multi-Repository Chat
          </button>
        </div>
        <div className="chat-container">
          <div className="messages">
            {(messages[selectedNamespace] || []).map((message, index) => (
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
      </div>
      {showMultiSelect && (
        <MultiNamespaceSelector
          namespaces={namespaces}
          selectedNamespaces={selectedMultiNamespaces}
          onSelect={handleMultiNamespaceSelect}
          onStartChat={handleStartMultiChat}
        />
      )}
    </div>
  );
};

export default Chatbot;
