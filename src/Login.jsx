import { useState } from "react";
import "./login.css";

const API_URL = "http://localhost:8080/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("ddlLabUser", data.name || username);

      onLogin(data.name || username);
    } catch (error) {
      setMessage("Cannot connect to Java backend");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          DDL
        </div>

        <div className="login-brand">
          <h1>DDL LAB</h1>
          <p>AI VOICE AUTOMATION</p>
        </div>

        <div className="login-heading">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to DDL LAB</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="login-field">
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {message && (
            <div className="login-error">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>

        </form>

        <div className="login-footer">
          DDL LAB © 2026
        </div>

      </div>
    </div>
  );
}