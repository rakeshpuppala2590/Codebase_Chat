// page.js
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
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState({});
  const [namespaces, setNamespaces] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState(null);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [selectedMultiNamespaces, setSelectedMultiNamespaces] = useState([]);
  const [isMultiChat, setIsMultiChat] = useState(false);
  const [multiChatMessages, setMultiChatMessages] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Prism.highlightAll();
    }
  }, [messages, multiChatMessages]);

  useEffect(() => {
    fetchNamespaces();
  }, []);

  useEffect(() => {
    if (selectedNamespace) {
      fetchChatHistory(selectedNamespace);
    }
  }, [selectedNamespace]);

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
        [namespace]: data || [],
      }));
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const handleNamespaceSelect = (namespace) => {
    setSelectedNamespace(namespace);
  };

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

  // const formatMessage = (text) => {
  //   if (!text) return "";

  //   if (typeof window !== "undefined") {
  //     Prism.highlightAll();
  //   }

  //   return text
  //     .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
  //       const language = lang || "javascript";
  //       const highlightedCode = Prism.highlight(
  //         code.trim(),
  //         Prism.languages[language] || Prism.languages.javascript,
  //         language
  //       );
  //       return `<pre class="language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>`;
  //     })
  //     .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  //     .replace(/\*(.*?)\*/g, "<em>$1</em>")
  //     .replace(/\~\~(.*?)\~\~/g, "<del>$1</del>");
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedNamespace) return;

    const userMessage = {
      sender: "user",
      text: input,
      namespace: selectedNamespace,
      created_at: new Date().toISOString(),
    };

    try {
      const { error: msgError } = await supabase
        .from("messages")
        .insert([userMessage]);

      if (msgError) throw msgError;

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
        namespace: selectedNamespace,
        created_at: new Date().toISOString(),
      };

      await supabase.from("messages").insert([botMessage]);

      setMessages((prev) => ({
        ...prev,
        [selectedNamespace]: [...(prev[selectedNamespace] || []), botMessage],
      }));
    } catch (error) {
      console.error("Error:", error);
    }
    setInput("");
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

    setMultiChatMessages((prev) => [...prev, userMessage]);

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

      setMultiChatMessages((prev) => [...prev, botMessage]);
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
      <div className="chat-container">
        {isMultiChat ? (
          <div className="multi-chat-header">
            <div className="selected-repos mb-2">
              {selectedMultiNamespaces.map((ns) => (
                <span key={ns} className="multi-chat-badge">
                  {ns.split("/").pop()}
                </span>
              ))}
            </div>
            <button
              onClick={() => {
                setIsMultiChat(false);
                setSelectedMultiNamespaces([]);
                setMultiChatMessages([]);
              }}
              className="text-sm text-blue-600"
            >
              Exit Multi-Chat
            </button>
          </div>
        ) : (
          <div className="p-4 border-b">
            <button
              onClick={() => setShowMultiSelect(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Start Multi-Repository Chat
            </button>
          </div>
        )}

        <div className="messages">
          {isMultiChat
            ? multiChatMessages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  {message.sender === "bot" ? (
                    <div className="formatted-content">
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>
              ))
            : (messages[selectedNamespace] || []).map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  {message.sender === "bot" ? (
                    <div className="formatted-content">
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>
              ))}
        </div>

        <form
          onSubmit={isMultiChat ? handleMultiSubmit : handleSubmit}
          className="input-form"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${
              isMultiChat ? "selected repositories" : "the codebase"
            }...`}
            className="chat-input"
          />
          <button type="submit" className="submit-btn">
            Send
          </button>
        </form>

        {showMultiSelect && (
          <MultiNamespaceSelector
            namespaces={namespaces}
            selectedNamespaces={selectedMultiNamespaces}
            onSelect={handleMultiNamespaceSelect}
            onStartChat={handleStartMultiChat}
          />
        )}
      </div>
    </div>
  );
};

export default Chatbot;
