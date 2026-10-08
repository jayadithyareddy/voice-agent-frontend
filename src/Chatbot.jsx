import { useState } from "react";

const API_URL = "https://voice-agent-backend-yzgl.onrender.com/api";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Chatbot request failed");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.message ||
            data.response ||
            data.reply ||
            "No response received.",
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: error.message || "Unable to connect to the AI assistant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.length === 0 && (
          <div className="chatbot-empty">
            <h3>AI Voice Agent Assistant</h3>
            <p>Ask me anything about your customers or calls.</p>
          </div>
        )}

        {messages.map((item, index) => (
          <div
            key={index}
            className={`chat-message ${
              item.role === "user" ? "user-message" : "assistant-message"
            }`}
          >
            <div className="chat-message-content">{item.content}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant-message">
            <div className="chat-message-content">Thinking...</div>
          </div>
        )}
      </div>

      <form className="chatbot-input-area" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Ask the AI assistant..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={loading}
        />

        <button type="submit" disabled={loading || !message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}