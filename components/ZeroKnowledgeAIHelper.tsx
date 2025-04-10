"use client";

import React, { useState, useEffect } from "react";
import "./ZeroKnowledgeAIHelper.css";

function ZeroKnowledgeAIHelper() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [chatReply, setChatReply] = useState("");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatRedFlag, setChatRedFlag] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false); // New state for chat loading
  const [showOutput, setShowOutput] = useState(true);

  useEffect(() => {
    if (outputText || redFlags.length > 0) {
      const timer = setTimeout(() => {
        setShowOutput(false);
        setOutputText("");
        setRedFlags([]);
      }, 5 * 60 * 1000); // 5 mins auto-clear
      return () => clearTimeout(timer);
    }
  }, [outputText, redFlags]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText: inputText }),
      });
      const data = await res.json();
      setOutputText(`🧾 Summary: ${data.summary}`);
      setRedFlags(data.redFlags || []);
      setShowOutput(true);
    } catch {
      setOutputText("⚠️ Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatRedFlag || !chatQuestion) {
      setChatReply("❌ Please provide a valid red flag and question.");
      return;
    }

    setIsChatLoading(true); // Set chat loading to true when asking the chatbot

    const res = await fetch("/api/chat-legal-help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redFlag: chatRedFlag, question: chatQuestion }),
    });

    const data = await res.json();
    setChatReply(data.reply || "⚠️ No reply received.");

    setIsChatLoading(false); // Set chat loading to false once the response is received
  };

  return (
    <div className="zk-container">
      <h1 className="zk-title">🔐 AI Contract Analyzer</h1>

      <textarea
        value={inputText}
        placeholder="Paste your contract text here..."
        onChange={(e) => setInputText(e.target.value)}
        className="zk-input"
      />

      <button onClick={handleAnalyze} disabled={isLoading} className="zk-button">
        {isLoading ? "Analyzing..." : "Analyze with AI"}
      </button>

      {showOutput && outputText && (
        <div className="zk-card fade-in">
          <h3 className="zk-heading">Confession Mode Output (5 mins auto-clear):</h3>
          <p className="zk-summary">{outputText}</p>

          <div className="zk-flags">
            <h4>⚠️ Red Flags:</h4>
            {redFlags.map((flag, i) => (
              <div key={i} className="zk-flag">
                <span>• {flag}</span>
                <button
                  onClick={() => {
                    setChatRedFlag(flag);
                    setChatQuestion("What is a good remedy clause for this?");
                    setChatReply("");
                    setShowChat(true);
                  }}
                  className="zk-chat-link"
                >
                  Chat 💬
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showChat && (
        <div className="zk-chat-box fade-in">
          <h4 className="zk-chat-label">🧠 Ask about: {chatRedFlag}</h4>
          <textarea
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            placeholder="Ask your question..."
            className="zk-input"
          />
          <button
            onClick={sendChat}
            className={`zk-button ${isChatLoading ? "zk-button-yellow" : "zk-button-green"}`}
          >
            {isChatLoading ? "Asking..." : "Ask Chatbot"}
          </button>
          {chatReply && <div className="zk-chat-reply">{chatReply}</div>}
        </div>
      )}
    </div>
  );
}

export default ZeroKnowledgeAIHelper;
