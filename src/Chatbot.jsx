import { useState } from "react";
import { Bot, Send, X, MessageCircle, User } from "lucide-react";
import "./chatbot.css";

const API_URL = "https://voice-agent-backend-yzgl.onrender.com/api";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I am the DDL LAB AI assistant. How can I help you?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    const text = input.trim();

    if (!text || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Chatbot API unavailable");
      }

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "bot",
          text:
            data.reply ||
            data.message ||
            "I received your message.",
        },
      ]);
    } catch (error) {
      let reply =
        "I am currently running in demo mode. Your message was received.";

      const lowerText = text.toLowerCase();

      if (
        lowerText.includes("hello") ||
        lowerText.includes("hi")
      ) {
        reply =
          "Hello! Welcome to DDL LAB. How can I help you?";
      } else if (
        lowerText.includes("customer")
      ) {
        reply =
          "You can manage customers from the Customers section of the DDL LAB dashboard.";
      } else if (
        lowerText.includes("voice")
      ) {
        reply =
          "The DDL LAB Voice Agent is designed to handle customer conversations automatically.";
      } else if (
        lowerText.includes("knowledge")
      ) {
        reply =
          "The Knowledge Base stores information that can be used by the AI voice agent.";
      } else if (
        lowerText.includes("call")
      ) {
        reply =
          "Call records can be managed through the Voice Agent and Calls backend APIs.";
      } else if (
        lowerText.includes("help")
      ) {
        reply =
          "I can help with customers, voice calls, knowledge base, analytics and DDL LAB features.";
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: reply,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          className="chatbot-floating-button"
          onClick={() => setOpen(true)}
          title="Open DDL LAB AI Chat"
        >
          <MessageCircle size={23} />
        </button>
      )}

      {open && (
        <div className="chatbot-window">

          <div className="chatbot-header">

            <div className="chatbot-header-info">

              <div className="chatbot-header-icon">
                <Bot size={20} />
              </div>

              <div>
                <strong>
                  DDL LAB AI
                </strong>

                <span>
                  Assistant
                </span>
              </div>

            </div>

            <button
              className="chatbot-close"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>

          </div>

          <div className="chatbot-messages">

            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${
                  message.sender === "user"
                    ? "user-message"
                    : "bot-message"
                }`}
              >

                <div className="chat-message-icon">
                  {message.sender === "user" ? (
                    <User size={14} />
                  ) : (
                    <Bot size={14} />
                  )}
                </div>

                <div className="chat-message-text">
                  {message.text}
                </div>

              </div>
            ))}

            {loading && (
              <div className="chat-message bot-message">

                <div className="chat-message-icon">
                  <Bot size={14} />
                </div>

                <div className="chat-typing">
                  <span />
                  <span />
                  <span />
                </div>

              </div>
            )}

          </div>

          <form
            className="chatbot-input-area"
            onSubmit={sendMessage}
          >

            <input
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Ask DDL LAB AI..."
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
            >
              <Send size={17} />
            </button>

          </form>

        </div>
      )}
    </>
  );
}



